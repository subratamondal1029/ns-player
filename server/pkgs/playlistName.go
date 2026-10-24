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
