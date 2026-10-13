package service

import (
	"encoding/json"
	"fmt"
	"io"
	"os"

	"github.com/subratamondal1029/ns-player/config"
)

type position struct {
	Index     *int     `json:"index" validate:"gte=0"`
	Timestamp *float64 `json:"timestamp" validate:"gte=0"`
}

type Timestamp struct {
	Playlist string   `json:"playlist" validate:"required,min=3"`
	Previous position `json:"previous"`
	Current  position `json:"current" validate:"required"`
}

var defaultPosition = position{
	Index:     new(0),
	Timestamp: new(0.0),
}

var defaultTimestamp = Timestamp{
	Previous: defaultPosition,
	Current:  defaultPosition,
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

func ResetTimestamp(playlist string) error {
	existingPlaylist, err := GetTimestamp()

	if err == nil && existingPlaylist != nil && existingPlaylist.Playlist == playlist {
		return nil // already existing playlist no need to overwrite
	}

	timestamp := defaultTimestamp
	timestamp.Playlist = playlist
	return SaveTimestamp(&timestamp)
}
