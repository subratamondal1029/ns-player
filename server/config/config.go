package config

import (
	"log"
	"net"
	"os"
	"path/filepath"
	"strings"

	"github.com/gosimple/slug"
	"github.com/joho/godotenv"
)

type Config struct {
	AppName     string
	AppNameSlug string
	StateDir    string
	Port        string
	Origin      string
	Ip          string
}

var config Config

func getIp() string {
	interfaces, err := net.Interfaces()
	if err != nil {
		log.Fatal(err)
	}

	var ip string

	for _, iface := range interfaces {
		if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
			continue
		}

		// Ignore Docker/virtual bridge interfaces
		if strings.HasPrefix(iface.Name, "docker") ||
			strings.HasPrefix(iface.Name, "br-") {
			continue
		}

		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}

		for _, addr := range addrs {
			ipnet, ok := addr.(*net.IPNet)
			if !ok {
				continue
			}

			ipv4 := ipnet.IP.To4()
			if ipv4 == nil {
				continue
			}

			ip = ipv4.String()
			break
		}

		if ip != "" {
			break
		}
	}

	return ip
}

func init() {
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

	timestampStatePath := filepath.Join(appConfPath, "timestamps.json")

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
		StateDir:    appConfPath,
		Port:        getEnv("PORT", "4920"),
		Origin:      getEnv("ORIGIN", "http://localhost:8081"),
		Ip:          getIp(),
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
