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

export interface QuickControlProps {
  updateTimestamp: (count: number, fwd?: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  playPause: () => void;
  subtitleToggle: () => void;
}
