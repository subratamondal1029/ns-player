package pkgs

import "testing"

func TestEncodePlaylistNameIdempotency(t *testing.T) {
	testCases := []string{
		"My Playlist",
		"   Rock & Roll   Hits   ",
		"already-encoded-name",
		"Mixed CASE With   Tabs\t\nAnd Spaces",
		"",
		"   ",
	}

	for _, input := range testCases {
		firstPass := EncodePlaylistName(input)
		secondPass := EncodePlaylistName(firstPass)

		if firstPass != secondPass {
			t.Errorf("EncodePlaylistName is not idempotent for %q: first pass %q, second pass %q", input, firstPass, secondPass)
		}
	}
}
