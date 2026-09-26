package main

import (
	"fmt"
	"net/http"
	"os"

	_ "github.com/joho/godotenv/autoload"
	"github.com/subratamondal1029/ns-player/internal/handler"
)

func main() {
	mux := http.NewServeMux()

	PORT := os.Getenv("PORT")
	ORIGIN := os.Getenv("ORIGIN")

	if PORT == "" {
		PORT = "8080"
	}

	if ORIGIN == "" {
		ORIGIN = "http://localhost:8081"
	}

	// Handlers
	mux.HandleFunc("POST /api/timestamp", handler.StoreTimestamp)
	mux.HandleFunc("GET /api/timestamp", handler.ReadTimestamp)

	fmt.Printf("NS-Player: Running on port %s\n", PORT)
	err := http.ListenAndServe(fmt.Sprintf(":%s", PORT), mux)

	if err != nil {
		fmt.Printf("NS-Player: Error starting server: %v\n", err)
	}
}
