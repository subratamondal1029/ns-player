import { Dialogue } from "@ltftf/srt-parser-2";

export interface PlayerVideo {
  title: string;
  uri: string;
  initialTimestamp: number;
  subtitle: Dialogue[] | null;
}

export interface VideoPlayerProps {
  video: PlayerVideo;
  hasPrev: boolean;
  hasNext: boolean;
  onBack: () => void;
  next: () => void;
  prev: () => void;
  updateHistory: (timestamp: number) => void;
}

export interface QuickControlProps {
  updateTimestamp: (count: number, fwd?: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  playPause: () => void;
  subtitleToggle: () => void;
  hideControls: () => void;
}
