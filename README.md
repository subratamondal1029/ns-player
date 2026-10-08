# NS Player

NS Player is an offline-first, cross-platform local video player designed for seamless playback and timestamp synchronization between **Linux** and **Android** across a local network without requiring internet access.

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

Synchronization works completely offline over your local Wi-Fi / LAN network:

1. **Linux**: Generate a QR code in the app by clicking the Sync button.
2. **Android**: Open the built-in scanner and scan the Linux screen's QR code.
3. **Data Exchange**: Send progress from mobile to desktop or receive latest timestamps from the desktop server.

---

## Usage Requirements & Conventions

To ensure proper media tracking, subtitle loading, and synchronization across devices:

- **Video Naming Convention**: Video files within a playlist must follow sequential numbering prefix format (e.g., `001`, `002`, `003`, etc.).
- **Subtitle Support (English only for now)**: Single-track `.srt` subtitle files matching the video base name with the `.en.srt` extension will be loaded and synchronized automatically.

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

## Roadmap

- [x] Subtitle support (Single-track English `.en.srt`)
- [ ] Improved double-tap skip functionality
- [ ] Pan-gesture volume controls
- [ ] Automatic local network device discovery and seamless background sync

> [!NOTE]
> This application was designed around a personal workflow and specific requirements. If you have different preferences or feature needs, feel free to fork the repository and tailor it to your use case.
