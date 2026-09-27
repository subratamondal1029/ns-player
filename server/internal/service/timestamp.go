package service

import (
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/subratamondal1029/ns-player/config"
)

type video struct {
	Index     int     `json:"index"`
	Timestamp float64 `json:"timestamp"`
}

type Timestamp struct {
	Playlist string `json:"playlist"`
	Previous video  `json:"previous"`
	Current  video  `json:"current"`
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

func CompareTimestamps(timestamp *Timestamp) (*Timestamp, error) {
	existing, err := GetTimestamp(timestamp.Playlist)
	if err != nil {
		return nil, err
	}

	if existing.Playlist != timestamp.Playlist {
		return timestamp, nil
	}

	if existing.Previous.Index < timestamp.Previous.Index || existing.Current.Index < timestamp.Current.Index {
		return timestamp, nil
	}

	return existing, nil
}
