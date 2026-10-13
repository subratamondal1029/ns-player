package config

import (
	"log"
	"os"
	"path/filepath"

	"github.com/gosimple/slug"
	"github.com/joho/godotenv"
)

type ENV string

const (
	ENVDevelopment ENV = "development"
	ENVProduction  ENV = "production"
)

type Config struct {
	AppName     string
	AppNameSlug string
	StatePath   string
	Port        string
	Origin      string
	Env         ENV
}

var config Config

func init() {
	_ = godotenv.Load(".env.local", "server/.env.local")

	// Environment
	env := ENV(getEnv("ENV", "production"))

	// app info
	appName := getEnv("APP_NAME", "NS Player")
	appNameSlug := slug.Make(appName)

	// state info
	usrConf, err := os.UserConfigDir()

	if err != nil {
		log.Fatalf("Error getting user config directory: %v", err)
	}

	appConfPath := filepath.Join(usrConf, appNameSlug)

	if err := os.MkdirAll(appConfPath, 0755); err != nil {
		log.Fatalf("Error creating state directory: %v", err)
	}

	stateFileName := "timestamps.json"
	if env == ENVDevelopment {
		stateFileName = "timestamps_dev.json"
	}

	timestampStatePath := filepath.Join(appConfPath, stateFileName)

	timestampStat, err := os.Stat(timestampStatePath)

	if err != nil {
		if os.IsNotExist(err) {
			if err := os.WriteFile(timestampStatePath, []byte("{}"), 0644); err != nil {
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
		StatePath:   timestampStatePath,
		Port:        getEnv("PORT", "4920"),
		Origin:      getEnv("ORIGIN", "http://localhost:8081"),
		Env:         env,
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
