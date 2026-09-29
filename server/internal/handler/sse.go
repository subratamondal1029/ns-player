package handler

import (
	"fmt"
	"net/http"
)

var SSEChan = make(chan bool, 1) // okay for single use not for multiple users

func SyncSSE(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	select {
	case <-r.Context().Done():
		return
	case done := <-SSEChan:
		fmt.Fprintf(w, "event: sync\ndata: %t\n\n", done)
		flusher.Flush()
	}
}
