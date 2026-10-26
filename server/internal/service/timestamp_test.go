package service_test

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/subratamondal1029/ns-player/config"
	"github.com/subratamondal1029/ns-player/internal/service"
	"github.com/subratamondal1029/ns-player/pkgs"
)

func ptr[T any](v T) *T {
	return &v
}

func setupTestConfig(t *testing.T) {
	tempDir := t.TempDir()
	statePath := filepath.Join(tempDir, "timestamps.json")
	backupPath := filepath.Join(tempDir, "timestamps.bak.json")

	_ = os.WriteFile(statePath, []byte("{}"), 0644)

	originalConfig := config.Get()
	testConfig := originalConfig
	testConfig.StatePath = statePath
	testConfig.BackupPath = backupPath
	config.SetForTest(testConfig)

	t.Cleanup(func() {
		config.SetForTest(originalConfig)
	})
}

func TestUploadPlaylistBackupAndRestore(t *testing.T) {
	setupTestConfig(t)

	// 1. Upload Playlist A for the first time
	tsA, err := service.UploadPlaylist("playlist-A")
	if err != nil {
		t.Fatalf("unexpected error uploading playlist A: %v", err)
	}
	if !pkgs.ComparePlaylistName(tsA.Playlist, "playlist-A") {
		t.Fatalf("expected playlist-A, got %s", tsA.Playlist)
	}

	// Modify state for Playlist A (e.g., user watched some videos)
	tsA.Current.Index = ptr(3)
	tsA.Current.Timestamp = ptr(123.45)
	tsA.UpdatedAt = 1700000000000
	if err := service.SaveTimestamp(tsA); err != nil {
		t.Fatalf("failed to save timestamp: %v", err)
	}

	// 2. Upload Playlist B
	// This should backup Playlist A into timestamps.bak.json and initialize Playlist B
	tsB, err := service.UploadPlaylist("playlist-B")
	if err != nil {
		t.Fatalf("unexpected error uploading playlist B: %v", err)
	}
	if !pkgs.ComparePlaylistName(tsB.Playlist, "playlist-B") {
		t.Fatalf("expected playlist-B, got %s", tsB.Playlist)
	}

	// Check that Playlist A was saved to backup
	bakA, err := service.GetBackupTimestamp("playlist-A")
	if err != nil {
		t.Fatalf("failed to get backup for playlist-A: %v", err)
	}
	if bakA == nil {
		t.Fatalf("expected playlist-A in backup store")
	}
	if *bakA.Current.Index != 3 || *bakA.Current.Timestamp != 123.45 || bakA.UpdatedAt != 1700000000000 {
		t.Fatalf("backup state did not match expected: %+v", bakA)
	}

	// 3. Upload Playlist A again (re-import)
	// It should restore Playlist A from backup store, keeping original updatedAt
	restoredA, err := service.UploadPlaylist("playlist-A")
	if err != nil {
		t.Fatalf("unexpected error re-importing playlist A: %v", err)
	}
	if !pkgs.ComparePlaylistName(restoredA.Playlist, "playlist-A") {
		t.Fatalf("expected playlist-A, got %s", restoredA.Playlist)
	}
	if *restoredA.Current.Index != 3 || *restoredA.Current.Timestamp != 123.45 {
		t.Fatalf("expected restored index 3 and timestamp 123.45, got %v and %v", *restoredA.Current.Index, *restoredA.Current.Timestamp)
	}
	if restoredA.UpdatedAt != 1700000000000 {
		t.Fatalf("expected restored updatedAt to be 1700000000000, got %d", restoredA.UpdatedAt)
	}

	// Verify Playlist B was backed up when switching to Playlist A
	bakB, err := service.GetBackupTimestamp("playlist-B")
	if err != nil {
		t.Fatalf("failed to get backup for playlist-B: %v", err)
	}
	if bakB == nil {
		t.Fatalf("expected playlist-B in backup store")
	}
}
