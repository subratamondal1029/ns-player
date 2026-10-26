import { MediaNotificationProps } from "@/types/notification.types";
import { decodePlaylistName } from "@/utils/playlistName";
import React, { useEffect } from "react";

/**
 * Web MediaNotification component.
 * Integrates with navigator.mediaSession and sets document.title.
 */
const MediaNotification: React.FC<MediaNotificationProps> = ({
  videoTitle,
  playlistName,
  isPlaying,
  hasPrev,
  hasNext,
  onPlay,
  onPause,
  onNext,
  onPrev,
}) => {
  const decodedPlaylist = decodePlaylistName(playlistName);

  // Sync document.title with format: video name | playlist name
  useEffect(() => {
    if (typeof document === "undefined") return;

    const originalTitle = document.title;
    const formattedTitle = decodedPlaylist
      ? `${videoTitle} | ${decodedPlaylist}`
      : videoTitle;

    document.title = formattedTitle;

    return () => {
      document.title = originalTitle;
    };
  }, [videoTitle, decodedPlaylist]);

  // Sync navigator.mediaSession metadata & playbackState
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }

    if ("MediaMetadata" in window) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: videoTitle,
        artist: decodedPlaylist || undefined,
        album: decodedPlaylist || undefined,
      });
    }

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [videoTitle, decodedPlaylist, isPlaying]);

  // Sync navigator.mediaSession action handlers
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.setActionHandler("play", () => {
        onPlay();
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        onPause();
      });

      navigator.mediaSession.setActionHandler(
        "previoustrack",
        hasPrev ? () => onPrev() : null,
      );

      navigator.mediaSession.setActionHandler(
        "nexttrack",
        hasNext ? () => onNext() : null,
      );
    } catch {
      // Ignore unsupported action errors in certain browsers
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      } catch {
        // Ignore errors on cleanup
      }
    };
  }, [hasPrev, hasNext, onPlay, onPause, onNext, onPrev]);

  return null;
};

export default MediaNotification;
