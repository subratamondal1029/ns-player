import {parse} from "@plussub/srt-vtt-parser"

export type SubtitleEntry = ReturnType<typeof parse>["entries"][number]

export interface PlayerVideo {
  title: string;
  uri: string;
  initialTimestamp: number;
  subtitle: SubtitleEntry[] | null;
}

export interface VideoPlayerProps {
  video: PlayerVideo;
  playlistName?: string;
  hasPrev: boolean;
  hasNext: boolean;
  onBack: () => void;
  next: () => void;
  prev: () => void;
  updateHistory: (timestamp: number) => void;
}

export interface QuickControlProps {
  controlsVisible:  boolean;
  updateTimestamp: (count: number, fwd?: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  playPause: () => void;
  subtitleToggle: () => void;
  toggleControls: (show?: boolean) => void;
  closePlayer: () => void;
  toggleFullscreen: () => void;
}
