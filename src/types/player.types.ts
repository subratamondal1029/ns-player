import { JSX } from "react/jsx-runtime";

export interface PlayerVideo {
  title: string;
  uri: string;
  initialTimestamp: number;
  subtitle: string | null;
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

export interface QuickControlOp {
  position: "left" | "right" | "center";
  content: React.ReactNode;
}

export interface QuickControlProps {
  timestamp: number;
  duration: number;
  hasPrev: boolean;
  hasNext: boolean;
  hasSubtitle: boolean;
  op: QuickControlOp | null;
  updateTimestamp: (count: number, fwd?: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  playPause: () => void;
  subtitleToggle: () => void;
  volumeChange: (volume: number) => void;
}
