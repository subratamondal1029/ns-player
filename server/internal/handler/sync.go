package handler

import (
	"net/http"

	"github.com/skip2/go-qrcode"
	"github.com/subratamondal1029/ns-player/config"
	"github.com/subratamondal1029/ns-player/pkgs"
)

func GenerateSyncQr(w http.ResponseWriter, r *http.Request) {
	// Implementation for generating sync QR code
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
