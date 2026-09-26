package handler

import (
	"net/http"

	"github.com/subratamondal1029/ns-player/pkgs"
)

func Health(w http.ResponseWriter, r *http.Request) {
	pkgs.SendResponse(w, pkgs.ApiResponse{
		Status:  http.StatusOK,
		Message: "Health check passed",
	})
}
