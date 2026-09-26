package main

import (
	"fmt"
	"net/http"

	_ "github.com/joho/godotenv/autoload"
	"github.com/subratamondal1029/ns-player/config"
	"github.com/subratamondal1029/ns-player/internal/handler"
	"github.com/subratamondal1029/ns-player/internal/middleware"
)

func main() {
	conf := config.Get()
	mux := http.NewServeMux()

	// Handlers
	mux.HandleFunc("GET /api/health", handler.Health)
	mux.HandleFunc("POST /api/timestamp", handler.StoreTimestamp)
	mux.HandleFunc("GET /api/timestamp", handler.ReadTimestamp)

	// middleware
	handler := middleware.CORSMiddleware(mux)

	fmt.Printf("NS-Player: Running on port %s\n", conf.Port)
	err := http.ListenAndServe(fmt.Sprintf(":%s", conf.Port), handler)

	if err != nil {
		fmt.Printf("NS-Player: Error starting server: %v\n", err)
	}
}
