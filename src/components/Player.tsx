import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import VideoControls from "./controls/Controls";

type VideoPlayerProps = {
  uri: string;
  title: string;
  playlist: string;
  timestamp: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onBack: () => void;
  setTimestamp: (timestamp: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeChange: (volume: number) => void;
};

export default function VideoPlayer({
  uri,
  title,
  timestamp,
  setTimestamp,
  onBack,
}: VideoPlayerProps) {
  const videoRef = useRef<VideoView>(null);
  const intervalId = useRef<number | null>(null);

  const player = useVideoPlayer(uri);

  useEffect(() => {
    const playingChangeEvent = player.addListener("playingChange", (e) => {
      if (!e.isPlaying) {
        setTimestamp(player.currentTime);
        if (intervalId.current) {
          clearInterval(intervalId.current);
          intervalId.current = null;
        }
      } else {
        if (!intervalId.current) {
          intervalId.current = setInterval(() => {
            setTimestamp(player.currentTime);
          }, 1000);
        }
      }
    });

    const playerStatusChangeEvent = player.addListener("statusChange", (e) => {
      if (e.status === "readyToPlay") {
        player.currentTime = timestamp;
        playerStatusChangeEvent.remove();
      }
    });

    return () => {
      playingChangeEvent.remove();
      playerStatusChangeEvent.remove();
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
    };
  }, []);

  return (
    <View className="flex-1 w-full h-full bg-black justify-center relative">
      <StatusBar hidden />

      <VideoControls title={title} onBack={onBack} isPlaying={false} progress={50} player={player}>
        <VideoView
          ref={videoRef}
          style={styles.video}
          player={player}
          nativeControls={false}
          contentFit="contain"
          playsInline
          allowsPictureInPicture
          fullscreenOptions={{ enable: true }}
        />
      </VideoControls>
    </View>
  );
}

// expo-video black screen issue in React Native Wind resolve
const styles = StyleSheet.create({
  video: { width: "100%", height: "100%" },
});
