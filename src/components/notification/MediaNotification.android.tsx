import { MediaNotificationProps } from "@/types/notification.types";
import { requireOptionalNativeModule } from "expo";
import React, { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

// Safely probe if native module is available (e.g. in development APK build vs Expo Go)
const isNativeModuleAvailable =
  !!requireOptionalNativeModule("ExpoMediaControl");

// Lazily load expo-media-control only when the native module is compiled into the app
let MediaControl: typeof import("expo-media-control").MediaControl | null =
  null;
let Command: typeof import("expo-media-control").Command | null = null;
let PlaybackState: typeof import("expo-media-control").PlaybackState | null =
  null;

if (isNativeModuleAvailable) {
  try {
    const mc = require("expo-media-control");
    MediaControl = mc.MediaControl;
    Command = mc.Command;
    PlaybackState = mc.PlaybackState;
  } catch {
    MediaControl = null;
  }
}

/**
 * Android MediaNotification component.
 * Uses expo-media-control for Android MediaSession notification when running in a dev build.
 * Gracefully no-ops in Expo Go where native code is unavailable.
 * Disables media controls and pauses when the app is backgrounded.
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
  // If running in Expo Go or unlinked build, safely return null
  if (!isNativeModuleAvailable || !MediaControl || !Command || !PlaybackState) {
    if (__DEV__) {
      console.warn(
        "EXPO :: notification controls does not supported on Expo GO; use development build instead!",
      );
    }
    return null;
  }

  return (
    <ActiveAndroidMediaNotification
      videoTitle={videoTitle}
      playlistName={playlistName}
      isPlaying={isPlaying}
      hasPrev={hasPrev}
      hasNext={hasNext}
      onPlay={onPlay}
      onPause={onPause}
      onNext={onNext}
      onPrev={onPrev}
    />
  );
};

const ActiveAndroidMediaNotification: React.FC<MediaNotificationProps> = ({
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
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onNextRef = useRef(onNext);
  const onPrevRef = useRef(onPrev);
  const hasNextRef = useRef(hasNext);
  const hasPrevRef = useRef(hasPrev);

  onPlayRef.current = onPlay;
  onPauseRef.current = onPause;
  onNextRef.current = onNext;
  onPrevRef.current = onPrev;
  hasNextRef.current = hasNext;
  hasPrevRef.current = hasPrev;

  // Initialize and update media control capabilities based on hasNext / hasPrev
  useEffect(() => {
    if (!MediaControl || !Command) return;

    const capabilities = [Command.PLAY, Command.PAUSE];
    const compactCapabilities = [Command.PLAY];

    if (hasPrev) {
      capabilities.push(Command.PREVIOUS_TRACK);
      compactCapabilities.unshift(Command.PREVIOUS_TRACK);
    }
    if (hasNext) {
      capabilities.push(Command.NEXT_TRACK);
      compactCapabilities.push(Command.NEXT_TRACK);
    }

    MediaControl.enableMediaControls({
      capabilities,
      compactCapabilities,
    }).catch(() => {});
  }, [hasPrev, hasNext]);

  // Sync track metadata
  useEffect(() => {
    if (!MediaControl) return;

    MediaControl.updateMetadata({
      title: videoTitle,
      album: playlistName,
    }).catch(() => {});
  }, [videoTitle, playlistName]);

  // Sync playback state
  useEffect(() => {
    if (!MediaControl || !PlaybackState) return;

    MediaControl.updatePlaybackState(
      isPlaying ? PlaybackState.PLAYING : PlaybackState.PAUSED,
    ).catch(() => {});
  }, [isPlaying]);

  // Event listener for lock screen / notification actions
  useEffect(() => {
    if (!MediaControl || !Command) return;

    const removeListener = MediaControl.addListener((event) => {
      switch (event.command) {
        case Command?.PLAY:
          onPlayRef.current();
          break;
        case Command?.PAUSE:
          onPauseRef.current();
          break;
        case Command?.NEXT_TRACK:
          if (hasNextRef.current) {
            onNextRef.current();
          }
          break;
        case Command?.PREVIOUS_TRACK:
          if (hasPrevRef.current) {
            onPrevRef.current();
          }
          break;
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  // Strict "No Background Play": dismiss notification & pause on app background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (!MediaControl || !Command || !PlaybackState) return;

      if (nextAppState !== "active") {
        onPauseRef.current();
        MediaControl.disableMediaControls().catch(() => {});
      } else {
        const capabilities = [Command.PLAY, Command.PAUSE];
        const compactCapabilities = [Command.PLAY];

        if (hasPrevRef.current) {
          capabilities.push(Command.PREVIOUS_TRACK);
          compactCapabilities.unshift(Command.PREVIOUS_TRACK);
        }
        if (hasNextRef.current) {
          capabilities.push(Command.NEXT_TRACK);
          compactCapabilities.push(Command.NEXT_TRACK);
        }

        MediaControl.enableMediaControls({
          capabilities,
          compactCapabilities,
        })
          .then(() => {
            MediaControl?.updateMetadata({
              title: videoTitle,
              album: playlistName,
            }).catch(() => {});
            MediaControl?.updatePlaybackState(
              isPlaying ? PlaybackState.PLAYING : PlaybackState.PAUSED,
            ).catch(() => {});
          })
          .catch(() => {});
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [videoTitle, playlistName, isPlaying]);

  // Teardown on unmount
  useEffect(() => {
    return () => {
      MediaControl?.disableMediaControls().catch(() => {});
    };
  }, []);

  return null;
};

export default MediaNotification;
