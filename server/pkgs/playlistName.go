package pkgs

import (
	"regexp"
	"strings"
)

var whitespaceRegex = regexp.MustCompile(`\s+`)

// EncodePlaylistName trims, lowercases, and replaces contiguous whitespace with hyphens.
func EncodePlaylistName(name string) string {
	trimmed := strings.TrimSpace(name)
	lowered := strings.ToLower(trimmed)
	return whitespaceRegex.ReplaceAllString(lowered, "-")
}

// ComparePlaylistName checks if two playlist names match, providing backward
// compatibility by comparing their encoded versions.
func ComparePlaylistName(a, b string) bool {
	return EncodePlaylistName(a) == EncodePlaylistName(b)
}

