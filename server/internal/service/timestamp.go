package service

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/subratamondal1029/ns-player/config"
	"github.com/subratamondal1029/ns-player/pkgs"
)

type position struct {
	Index     *int     `json:"index" validate:"gte=0"`
	Timestamp *float64 `json:"timestamp" validate:"gte=0"`
}

type Timestamp struct {
	Playlist  string   `json:"playlist" validate:"required,min=3"`
	Previous  position `json:"previous"`
	Current   position `json:"current" validate:"required"`
	UpdatedAt int      `json:"updatedAt" validate:"gte=0"`
}

var defaultPosition = position{
	Index:     new(0),
	Timestamp: new(0.0),
}

var defaultTimestamp = Timestamp{
	Previous:  defaultPosition,
	Current:   defaultPosition,
	UpdatedAt: 0,
}

func DecodeTimestampJson(data io.ReadCloser) (*Timestamp, error) {
	var timestamp Timestamp

	decoder := json.NewDecoder(data)
	defer data.Close()

	decoder.DisallowUnknownFields()

	err := decoder.Decode(&timestamp)

	if err != nil {
		return nil, fmt.Errorf("Failed to decode timestamp: %w", err)
	}

	return &timestamp, nil
}

func SaveTimestamp(timestamp *Timestamp) error {
	conf := config.Get()

	// Ensure playlist name is always stored encoded
	timestamp.Playlist = pkgs.EncodePlaylistName(timestamp.Playlist)

	data, err := json.Marshal(*timestamp)
	if err != nil {
		return err
	}

	return os.WriteFile(conf.StatePath, data, 0644)
}

func GetTimestamp() (*Timestamp, error) {
	conf := config.Get()

	data, err := os.ReadFile(conf.StatePath)
	if err != nil {
		return nil, err
	}

	var timestamp Timestamp
	err = json.Unmarshal(data, &timestamp)
	if err != nil {
		return nil, err
	}

	return &timestamp, nil
}

func CompareTimestamp(existing, newTimestamp *Timestamp) (*Timestamp, bool, error) {
	if existing == nil || newTimestamp == nil {
		return nil, false, fmt.Errorf("Both existing and new timestamp must be provided")
	}

	if existing.Playlist == "" {
		return newTimestamp, true, nil
	}

	// updatedAt is a millisecond coordinate of a date
	if existing.UpdatedAt >= newTimestamp.UpdatedAt {
		return existing, false, nil
	}

	return newTimestamp, true, nil
}

func ResetTimestamp(playlist string) error {
	existingPlaylist, err := GetTimestamp()

	if err == nil && existingPlaylist != nil && pkgs.ComparePlaylistName(existingPlaylist.Playlist, playlist) {
		return nil // already existing playlist no need to overwrite
	}

	timestamp := defaultTimestamp
	timestamp.Playlist = pkgs.EncodePlaylistName(playlist)
	return SaveTimestamp(&timestamp)
}

func getBackupStore() (map[string]Timestamp, error) {
	conf := config.Get()
	data, err := os.ReadFile(conf.BackupPath)
	if err != nil {
		if os.IsNotExist(err) {
			return make(map[string]Timestamp), nil
		}
		return nil, err
	}

	var backups map[string]Timestamp
	if err := json.Unmarshal(data, &backups); err != nil {
		// If empty or invalid json, fallback gracefully
		return make(map[string]Timestamp), nil
	}
	return backups, nil
}

func saveBackupStore(backups map[string]Timestamp) error {
	conf := config.Get()
	data, err := json.Marshal(backups)
	if err != nil {
		return err
	}

	dir := filepath.Dir(conf.BackupPath)
	tmpFile, err := os.CreateTemp(dir, "timestamps_bak_*.tmp")
	if err != nil {
		return err
	}
	tmpName := tmpFile.Name()

	if _, err := tmpFile.Write(data); err != nil {
		tmpFile.Close()
		_ = os.Remove(tmpName)
		return err
	}
	if err := tmpFile.Close(); err != nil {
		_ = os.Remove(tmpName)
		return err
	}

	return os.Rename(tmpName, conf.BackupPath)
}

func BackupTimestamp(timestamp *Timestamp) error {
	if timestamp == nil || timestamp.Playlist == "" {
		return nil
	}

	backups, err := getBackupStore()
	if err != nil {
		return err
	}

	encodedPlaylist := pkgs.EncodePlaylistName(timestamp.Playlist)
	toBackup := *timestamp
	toBackup.Playlist = encodedPlaylist
	backups[encodedPlaylist] = toBackup

	return saveBackupStore(backups)
}

func GetBackupTimestamp(playlist string) (*Timestamp, error) {
	backups, err := getBackupStore()
	if err != nil {
		return nil, err
	}

	encodedPlaylist := pkgs.EncodePlaylistName(playlist)
	if ts, exists := backups[encodedPlaylist]; exists {
		return &ts, nil
	}
	return nil, nil
}

func UploadPlaylist(playlist string) (*Timestamp, error) {
	encodedPlaylist := pkgs.EncodePlaylistName(playlist)

	// Step 1: Check existing current timestamp & back it up before altering
	current, err := GetTimestamp()
	if err == nil && current != nil && current.Playlist != "" {
		if err := BackupTimestamp(current); err != nil {
			return nil, fmt.Errorf("failed to backup current timestamp: %w", err)
		}
	}

	// Step 2: Check whether playlist already exists in current timestamp
	if current != nil && pkgs.ComparePlaylistName(current.Playlist, playlist) {
		return current, nil
	}

	// Step 3: Check backup store for the playlist
	bak, err := GetBackupTimestamp(playlist)
	if err != nil {
		return nil, fmt.Errorf("failed to check backup store: %w", err)
	}

	if bak != nil {
		// Restore from backup; keep original updatedAt intact
		if err := SaveTimestamp(bak); err != nil {
			return nil, fmt.Errorf("failed to restore timestamp from backup: %w", err)
		}
		return bak, nil
	}

	// Step 4: Absent from bak; initialize default timestamp
	newTimestamp := defaultTimestamp
	newTimestamp.Playlist = encodedPlaylist
	if err := SaveTimestamp(&newTimestamp); err != nil {
		return nil, fmt.Errorf("failed to initialize timestamp: %w", err)
	}

	return &newTimestamp, nil
}
