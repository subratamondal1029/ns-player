package handler

import (
	"io/fs"
	"net/http"
	"path"
	"strings"

	"github.com/subratamondal1029/ns-player/internal/embed"
)

func WebHandler() http.Handler {
	staticFs, err := fs.Sub(embed.WebAssets, "assets")
	if err != nil {
		panic(err)
	}

	fileServer := http.FileServer(http.FS(staticFs))

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		cleanPath := path.Clean("/" + r.URL.Path)
		name := strings.TrimPrefix(cleanPath, "/")

		// 1. Root request: serve index.html directly via fileServer
		if name == "" || name == "." {
			fileServer.ServeHTTP(w, r)
			return
		}

		// 2. Direct static file match (JS, CSS, images, etc.)
		if stat, err := fs.Stat(staticFs, name); err == nil && !stat.IsDir() {
			fileServer.ServeHTTP(w, r)
			return
		}

		// 3. Expo Router SSG route match (e.g. /player -> player.html)
		htmlFile := name + ".html"
		if stat, err := fs.Stat(staticFs, htmlFile); err == nil && !stat.IsDir() {
			r2 := r.Clone(r.Context())
			r2.URL.Path = "/" + htmlFile
			fileServer.ServeHTTP(w, r2)
			return
		}

		// 4. Missing static assets with an extension should return 404
		if path.Ext(name) != "" {
			http.NotFound(w, r)
			return
		}

		// 5. SPA fallback: client-side route fallback to /index.html
		r2 := r.Clone(r.Context())
		r2.URL.Path = "/index.html"
		fileServer.ServeHTTP(w, r2)
	})
}
