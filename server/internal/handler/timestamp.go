package handler

import (
	"net/http"

	"github.com/subratamondal1029/ns-player/internal/service"
	"github.com/subratamondal1029/ns-player/internal/validator"
	"github.com/subratamondal1029/ns-player/internal/worker"
	"github.com/subratamondal1029/ns-player/pkgs"
)

var writerWorkerDataChan = make(chan service.Timestamp)

func init() {
	go worker.StartWriterWorker(writerWorkerDataChan)
}

func StoreTimestamp(w http.ResponseWriter, r *http.Request) {
	timestamp, err := service.DecodeTimestampJson(r.Body)

	if err != nil {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "failed to decode timestamp",
		}, err)
		return
	}

	if err := validator.ValidateTimestamp(timestamp); err != nil {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusBadRequest,
			Message: err.Error(),
		}, err)
		return
	}

	// send to writer worker
	writerWorkerDataChan <- *timestamp

	pkgs.SendResponse(w, pkgs.ApiResponse{
		Status:  http.StatusOK,
		Message: "timestamp stored successfully",
	}, nil)
}

func ReadTimestamp(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	playlist := queryParams.Get("playlist")

	if playlist == "" {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusBadRequest,
			Message: "playlist is required",
		}, nil)
		return
	}

	timestamp, err := service.GetTimestamp()
	if err != nil {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "failed to get timestamp",
		}, err)
		return
	}

	if timestamp.Playlist != playlist {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusNotFound,
			Message: "Playlist does not exists",
		}, nil)
		return
	}

	pkgs.SendResponse(w, pkgs.ApiResponse{
		Status:  http.StatusOK,
		Message: "timestamp retrieved successfully",
		Data:    timestamp,
	}, nil)
}
