package pkgs

import (
	"log"
	"net"
	"strings"
)

func GetIp() string {
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
