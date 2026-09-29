package worker

import (
	"fmt"
	"time"

	"github.com/subratamondal1029/ns-player/internal/service"
)

func StartWriterWorker(dataStream <-chan service.Timestamp) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	count := 0
	var localCopy *service.Timestamp

	for {
		select {
		case timestamp := <-dataStream:
			localCopy = &timestamp
		case <-ticker.C:
			if localCopy != nil {
				count++
				fmt.Printf("Saving timestamp for playlist: %s (Count: %d)\n", localCopy.Playlist, count)
				service.SaveTimestamp(localCopy)
				localCopy = nil
			}
		}
	}
}
