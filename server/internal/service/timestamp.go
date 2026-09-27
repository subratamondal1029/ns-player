package service

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/subratamondal1029/ns-player/config"
)

type position struct {
	Index     int     `json:"index" validate:"gte=0"`
	Timestamp float64 `json:"timestamp" validate:"gte=0"`
}

type Timestamp struct {
	Playlist string   `json:"playlist" validate:"required,min=3"`
	Previous position `json:"previous" validate:"required"`
	Current  position `json:"current" validate:"required"`
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

	data, err := json.Marshal(*timestamp)
	if err != nil {
		return err
	}

	return os.WriteFile(filepath.Join(conf.StateDir, "timestamps.json"), data, 0644)
}

func GetTimestamp(playlist string) (*Timestamp, error) {
	conf := config.Get()

	data, err := os.ReadFile(filepath.Join(conf.StateDir, "timestamps.json"))
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

func CompareTimestamps(timestamp *Timestamp) (bool, *Timestamp, error) {
	existing, err := GetTimestamp(timestamp.Playlist)
	if err != nil {
		return false, nil, err
	}

	if existing.Playlist != timestamp.Playlist {
		return true, timestamp, nil
	}

	if existing.Previous.Index < timestamp.Previous.Index || existing.Current.Index < timestamp.Current.Index {
		return true, timestamp, nil
	}

	return false, existing, nil
}
