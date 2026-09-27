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

	updatable, timestampToStore, err := service.CompareTimestamps(timestamp)

	if err != nil {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "failed to compare timestamps",
		}, err)
		return
	}

	if !updatable {
		w.WriteHeader(http.StatusNotModified)
		return
	}

	err = service.SaveTimestamp(timestampToStore)

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
		Data:    *timestampToStore,
	}, nil)
}
