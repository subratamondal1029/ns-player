# NS Player

NS Player is an offline-first, cross-platform local video player designed for seamless playback and timestamp synchronization between **Linux** and **Android** across a local network without requiring internet access.

---

## Features

- **Cross-Platform Playback & Offline Sync**: Seamlessly sync playback progress between Linux and Android using local QR code scanning with last-write-wins resolution.
- **Last Playlist Backup & Restore**: Automatically backs up and restores the last active playlist state and playback progress across app restarts, reloads, and sessions on both Android and Linux/Web.
- **System Media Notification Controls**: Integrated system-level media notification controls (Play, Pause, Next, Previous) on both Android (via native media session) and Linux/Web (via Media Session API).
- **Subtitles Support**: Single-track subtitle loading (`.en.srt` or `.en.vtt`) with persistent subtitle visibility preferences across sessions.

---

## Architecture Overview

- **Linux (Desktop)**:
  - Built with React Native Web embedded into a Go backend server.
  - The Go backend acts as the central source of truth for timestamp management and sync operations.
  - Distributed as an AppImage package.
- **Android (Mobile)**:
  - Built with React Native.
  - Progress and timestamps are persisted locally using `AsyncStorage`.

---

## Local Synchronization

Synchronization works completely offline over your local Wi-Fi / LAN network using automatic last-write-wins resolution:

1. **Linux**: Generate a QR code in the app by clicking the Sync button.
2. **Android**: Open the built-in scanner and scan the Linux screen's QR code.
3. **Automatic Sync**: The server compares `updatedAt` timestamps between Android and Linux. The latest progress automatically becomes the source of truth and updates both devices with a single confirmation (no manual send/receive direction needed).

---

## Usage Requirements & Conventions

To ensure proper media tracking, subtitle loading, and synchronization across devices:

- **Video Naming Convention**: Video files within a playlist must follow sequential numbering prefix format (e.g., `001`, `002`, `003`, etc.).
- **Subtitle Support (English only for now)**: Single-track `.srt` or `.vtt` subtitle files matching the video base name with the `.en.srt` extension will be loaded and synchronized automatically.

| Type         | Format / Example            |
| :----------- | :-------------------------- |
| **Video**    | `001 - Introduction.mp4`    |
| **Subtitle** | `001 - Introduction.en.srt` |

- **Playlist Key**: The playlist key/name entered by the user must match identically on both Linux and Android.
- **Firewall & Network**: Port `4920` must be open and accessible on the local network.
- **Linux Prerequisites**: **Google Chrome** must be pre-installed on the host system.

---

## Installation & Downloads

Official pre-built binaries are available on the [Releases](https://github.com/subratamondal1029/ns-player/releases) page:

### Linux

1. Ensure **Google Chrome** is installed on your system.
2. Download the latest [`NS-Player.AppImage`](https://github.com/subratamondal1029/ns-player/releases/latest/download/NS-Player.AppImage).
3. Make it executable and run:
   ```bash
   chmod +x NS-Player.AppImage
   ./NS-Player.AppImage
   ```

### Android

1. Download the latest [`ns-player.apk`](https://github.com/subratamondal1029/ns-player/releases/latest/download/ns-player.apk).
2. Install the APK on your Android device.

---

> [!NOTE]
> This application was designed around a personal workflow and specific requirements. If you have different preferences or feature needs, feel free to fork the repository and tailor it to your use case.
