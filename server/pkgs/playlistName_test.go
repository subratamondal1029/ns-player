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

func TestComparePlaylistName(t *testing.T) {
	testCases := []struct {
		a        string
		b        string
		expected bool
	}{
		{"My Playlist", "my-playlist", true},
		{"my-playlist", "my-playlist", true},
		{"  My   Playlist  ", "my-playlist", true},
		{"MY PLAYLIST", "my-playlist", true},
		{"Playlist 1", "Playlist 2", false},
		{"", "", true},
	}

	for _, tc := range testCases {
		res := ComparePlaylistName(tc.a, tc.b)
		if res != tc.expected {
			t.Errorf("ComparePlaylistName(%q, %q) = %v; expected %v", tc.a, tc.b, res, tc.expected)
		}
	}
}

