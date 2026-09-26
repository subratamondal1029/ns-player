import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";

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
    console.log(`Initial timestamp: ${timestamp}`);
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

      {/* TODO: create custom UI for video controls */}
      <VideoView
        ref={videoRef}
        style={styles.video}
        player={player}
        nativeControls={true}
        contentFit="contain"
        playsInline
        allowsPictureInPicture
        fullscreenOptions={{ enable: true }}
      />

      {/* Top overlay */}
      <View className="absolute top-0 left-0 right-0 px-4 pt-4 pb-6 flex-row items-center justify-between bg-black/50">
        <Pressable onPress={onBack} hitSlop={12} className="w-10 items-start">
          <Text className="text-white text-3xl font-light leading-9">‹</Text>
        </Pressable>

        <Text
          className="flex-1 text-white text-base font-semibold text-center"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        <View className="w-10" />
      </View>
    </View>
  );
}

// expo-video black screen issue in React Native Wind resolve
const styles = StyleSheet.create({
  video: { width: "100%", height: "100%" },
});
