package handler

import (
	"encoding/json"
	"net/http"

	"github.com/subratamondal1029/ns-player/internal/service"
	"github.com/subratamondal1029/ns-player/pkgs"
)

func StoreTimestamp(w http.ResponseWriter, r *http.Request) {
	var timestamp service.Timestamp

	if err := json.NewDecoder(r.Body).Decode(&timestamp); err != nil {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "failed to decode timestamp",
		})
		return
	}
	defer r.Body.Close()

	if err := service.SaveTimestamp(timestamp); err != nil {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "failed to store timestamp",
		})
		return
	}

	pkgs.SendResponse(w, pkgs.ApiResponse{
		Status:  http.StatusOK,
		Message: "timestamp stored successfully",
	})
}

func ReadTimestamp(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	playlist := queryParams.Get("playlist")

	if playlist == "" {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusBadRequest,
			Message: "playlist is required",
		})
		return
	}

	timestamp, err := service.GetTimestamp(playlist)
	if err != nil {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "failed to get timestamp",
		})
		return
	}

	if timestamp.Playlist != playlist {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusNotFound,
			Message: "Playlist does not exists",
		})
		return
	}

	pkgs.SendResponse(w, pkgs.ApiResponse{
		Status:  http.StatusOK,
		Message: "timestamp retrieved successfully",
		Data:    timestamp,
	})
}
