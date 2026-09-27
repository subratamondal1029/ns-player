package worker

import (
	"fmt"
	"time"

	"github.com/subratamondal1029/ns-player/internal/service"
)

func StartWriterWorker(dataStream <-chan service.Timestamp) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	var localCopy service.Timestamp

	for {
		select {
		case timestamp := <-dataStream:
			localCopy = timestamp
		case <-ticker.C:
			if localCopy.Playlist != "" {
				updatable, timestampToStore, err := service.CompareTimestamps(&localCopy)
				if err != nil {
					fmt.Printf("Error: Failed to compare timestamps for playlist: %s, error: %v\n", localCopy.Playlist, err)
					continue
				}

				if !updatable {
					localCopy = service.Timestamp{}
					continue
				}

				fmt.Printf("Saving timestamp for playlist: %s\n", timestampToStore.Playlist)
				service.SaveTimestamp(timestampToStore)
				localCopy = service.Timestamp{}
			}
		}
	}
}
