export interface MediaNotificationProps {
  videoTitle: string;
  playlistName: string;
  isPlaying: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}
