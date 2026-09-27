package handler

import (
	"encoding/json"
	"net/http"

	"github.com/skip2/go-qrcode"
	"github.com/subratamondal1029/ns-player/config"
	"github.com/subratamondal1029/ns-player/internal/service"
	"github.com/subratamondal1029/ns-player/pkgs"
)

func GenerateSyncQr(w http.ResponseWriter, r *http.Request) {
	conf := config.Get()
	pngBytes, err := qrcode.Encode(conf.Ip, qrcode.Medium, 256)

	if err != nil {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "QR code generation failed",
		})
		return
	}

	w.Header().Set("Content-Type", "image/png")
	w.Write(pngBytes)
}

func SyncTimestamp(w http.ResponseWriter, r *http.Request) {
	var timestamp service.Timestamp

	if err := json.NewDecoder(r.Body).Decode(&timestamp); err != nil {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "failed to decode timestamp",
		})
		return
	}
	defer r.Body.Close()

	timestampToStore, err := service.CompareTimestamps(&timestamp)

	if err != nil {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "failed to compare timestamps",
		})
		return
	}

	err = service.SaveTimestamp(timestampToStore)

	if err != nil {
		pkgs.SendResponse(w, pkgs.ApiResponse{
			Status:  http.StatusInternalServerError,
			Message: "failed to sync timestamp",
		})
		return
	}

	pkgs.SendResponse(w, pkgs.ApiResponse{
		Status:  http.StatusOK,
		Message: "timestamp saved successfully",
		Data:    *timestampToStore,
	})
}
