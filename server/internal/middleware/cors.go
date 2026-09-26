package middleware

import (
	"net/http"

	"github.com/subratamondal1029/ns-player/config"
)

// CORSMiddleware wraps an http.Handler and adds CORS headers
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		conf := config.Get()

		w.Header().Set("Access-Control-Allow-Origin", conf.Origin)

		// Allow specific HTTP methods
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		// Allow specific headers sent by the client
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle browser preflight OPTIONS requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// Pass control to the next handler
		next.ServeHTTP(w, r)
	})
}
