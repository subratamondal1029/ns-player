package pkgs

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type ApiResponse struct {
	Success bool   `json:"success"`
	Status  int    `json:"status"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

func SendResponse(w http.ResponseWriter, response ApiResponse, err error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(response.Status)

	if response.Status < 300 {
		response.Success = true
	}

	if response.Status >= 500 {
		if err != nil {
			fmt.Printf("ERROR :: Internal :: %v", err)
		}
	}

	// Encode the response as JSON and write it to the response writer
	if err := json.NewEncoder(w).Encode(response); err != nil {
		fmt.Printf("ERROR :: ResponseEncoder :: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
