package service

type video struct {
	Index     int     `json:"index"`
	Timestamp float64 `json:"timestamp"`
}

type Timestamp struct {
	Playlist string  `json:"playlist"`
	Videos   []video `json:"videos"`
}

func SaveTimestamp(timestamp Timestamp) error {
	return nil
}

func GetTimestamp(playlist string) (*Timestamp, error) {
	return nil, nil
}
