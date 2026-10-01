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
