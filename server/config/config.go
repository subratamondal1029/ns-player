package config

import (
	"log"
	"os"
	"path/filepath"

	"github.com/gosimple/slug"
)

type Config struct {
	AppName     string
	AppNameSlug string
	StateDir    string
	Port        string
	Origin      string
}

var config Config

func init() {
	appName := getEnv("APP_NAME", "NS Player")
	appNameSlug := slug.Make(appName)

	usrConf, err := os.UserConfigDir()

	if err != nil {
		log.Fatalf("Error getting user config directory: %v", err)
	}

	appConfPath := filepath.Join(usrConf, appNameSlug)

	if err := os.MkdirAll(appConfPath, 0755); err != nil {
		log.Fatalf("Error creating state directory: %v", err)
	}

	timestampStatePath := filepath.Join(appConfPath, "timestamps.json")

	timestampStat, err := os.Stat(timestampStatePath)

	if err != nil {
		if os.IsNotExist(err) {
			if err := os.WriteFile(timestampStatePath, []byte{}, 0644); err != nil {
				log.Panicf("Can't create timestamp file, %v", err)
			}
		} else {
			log.Panicf("Error reading timestamp file, %v", err)
		}
	} else if timestampStat.IsDir() {
		log.Panicln("Timestamp file is a directory")
	}

	config = Config{
		AppName:     appName,
		AppNameSlug: appNameSlug,
		StateDir:    appConfPath,
		Port:        getEnv("PORT", "8080"),
		Origin:      getEnv("ORIGIN", "http://localhost:8081"),
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	return fallback
}

func Get() Config {
	return config
}
