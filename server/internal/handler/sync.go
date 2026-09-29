package handler

import (
	"fmt"
	"net/http"

	"github.com/skip2/go-qrcode"
	"github.com/subratamondal1029/ns-player/config"
	"github.com/subratamondal1029/ns-player/internal/service"
	"github.com/subratamondal1029/ns-player/internal/validator"
	"github.com/subratamondal1029/ns-player/pkgs"
)

func GenerateSyncQr(w http.ResponseWriter, r *http.Request) {
	conf := config.Get()
	url := fmt.Sprintf("http://%s:%s", conf.Ip, conf.Port)
	pngBytes, err := qrcode.Encode(url, qrcode.Medium, 256)

	if err != nil {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "QR code generation failed",
		}, err)
		return
	}

	w.Header().Set("Content-Type", "image/png")
	w.Write(pngBytes)
}

func SyncTimestamp(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// Reading timestamp for Receive request
		query := r.URL.Query()
		playlist := query.Get("playlist")

		if playlist == "" {
			pkgs.SendResponse(w, pkgs.ApiResponse{
				Status:  http.StatusBadRequest,
				Message: "Playlist parameter is required",
			}, nil)
			return
		}

		timestamp, err := service.GetTimestamp()
		if err != nil {
			pkgs.SendResponse(w, pkgs.ApiResponse{
				Status:  http.StatusInternalServerError,
				Message: "failed to get existing timestamp",
			}, err)
			return
		}

		if timestamp.Playlist != playlist {
			pkgs.SendResponse(w, pkgs.ApiResponse{
				Status:  http.StatusUnprocessableEntity,
				Message: "Playlist does not match for synchronization",
			}, nil)
			return
		}

		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusOK,
			Message: "Timestamp retrieved",
			Data:    timestamp,
		}, nil)
	case http.MethodPut:
		// Saving timestamp for Send request
		timestamp, err := service.DecodeTimestampJson(r.Body)

		if err != nil {
			fmt.Printf("ERROR :: SyncTimestamp :: %v", err)
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

		existing, err := service.GetTimestamp()
		if err != nil {
			pkgs.SendResponse(w, pkgs.ApiResponse{
				Status:  http.StatusInternalServerError,
				Message: "failed to get existing timestamp",
			}, err)
			return
		}

		if existing.Playlist != timestamp.Playlist {
			pkgs.SendResponse(w, pkgs.ApiResponse{
				Status:  http.StatusUnprocessableEntity,
				Message: "Playlist does not match for synchronization",
			}, nil)
			return
		}

		err = service.SaveTimestamp(timestamp)
		if err != nil {
			pkgs.SendResponse(w, pkgs.ApiResponse{
				Status:  http.StatusInternalServerError,
				Message: "failed to sync timestamp",
			}, err)
			return
		}

		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusOK,
			Message: "timestamp saved successfully",
			Data:    *timestamp,
		}, nil)

		SSEChan <- true
	default:
		http.Error(w, "Invalid Request", http.StatusMethodNotAllowed)
	}
}
