package pkgs

import (
	"encoding/json"
	"net/http"
)

type ApiResponse struct {
	Success bool   `json:"success"`
	Status  int    `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

func SendResponse(w http.ResponseWriter, response ApiResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(response.Status)

	if response.Status < 300 {
		response.Success = true
	}

	// Encode the response as JSON and write it to the response writer
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
