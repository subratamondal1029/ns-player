import { MediaNotificationProps } from "@/types/notification.types";
import React, { useCallback, useEffect } from "react";

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

  // Teardown media session only on unmount
  useEffect(() => {
    return () => {
      if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
        cleanMediaSession(navigator.mediaSession);
      }
    };
  }, [cleanMediaSession]);

  // Sync document.title and media metadata on video/playlist change
  useEffect(() => {
    if (typeof document === "undefined") return;

    const originalTitle = document.title;
    const formattedTitle = playlistName
      ? `${videoTitle} | ${playlistName}`
      : videoTitle;

    document.title = formattedTitle;

    if (
      typeof navigator !== "undefined" &&
      "mediaSession" in navigator &&
      "MediaMetadata" in window
    ) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: videoTitle,
        album: playlistName,
      });
    }

    return () => {
      document.title = originalTitle;
    };
  }, [videoTitle, playlistName]);

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
