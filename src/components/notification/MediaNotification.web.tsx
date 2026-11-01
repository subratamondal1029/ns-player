import { MediaNotificationProps } from "@/types/notification.types";
import { decodePlaylistName } from "@/utils/playlistName";
import React, { useCallback, useEffect, useMemo } from "react";

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
  const decodedPlaylist = useMemo(
    () => decodePlaylistName(playlistName),
    [playlistName],
  );

  const cleanMediaSession = useCallback((session: MediaSession) => {
    if (!session) return;
    console.log("Cleaning media session");

    try {
      session.playbackState = "none";
      session.metadata = null;

      session.setActionHandler("play", null);
      session.setActionHandler("pause", null);
      session.setActionHandler("previoustrack", null);
      session.setActionHandler("nexttrack", null);
    } catch {
      // ignore for unsupported browser
    }
  }, []);

  // Sync document.title and media metadata
  useEffect(() => {
    if (typeof document === "undefined") return;

    const originalTitle = document.title;
    const formattedTitle = decodedPlaylist
      ? `${videoTitle} | ${decodedPlaylist}`
      : videoTitle;

    document.title = formattedTitle;

    if (navigator.mediaSession && navigator.mediaSession.metadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: videoTitle,
        album: decodedPlaylist,
      });
    }

    return () => {
      document.title = originalTitle;
      cleanMediaSession(navigator.mediaSession)
    };
  }, [videoTitle, decodedPlaylist]);

  // Sync playbackState
  useEffect(() => {
    if (navigator.mediaSession) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  // Sync action handlers
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
  }, [hasPrev, hasNext, onPlay, onPause, onNext, onPrev]);

  return null;
};

export default MediaNotification;
