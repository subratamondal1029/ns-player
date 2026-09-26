package pkgs

import (
	"encoding/json"
	"net/http"
)

type ApiResponse struct {
	Status  int
	Message string
	Data    any
}

func SendResponse(w http.ResponseWriter, response ApiResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(response.Status)

	// Encode the response as JSON and write it to the response writer
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
