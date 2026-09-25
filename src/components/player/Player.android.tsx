import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef } from "react";
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";

type VideoPlayerProps = {
  uri: string;
  title: string;
  playlist: string;
  onBack: () => void;
  onPlayPause: () => void;
  onSkip: (timestamp: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeChange: (volume: number) => void;
};

export default function VideoPlayer({ uri, title, onBack }: VideoPlayerProps) {
  const videoRef = useRef<VideoView>(null);

  const player = useVideoPlayer(uri, (p) => {
    p.play();
  });

  useEffect(() => {
    const sub = player.addListener("statusChange", ({ status, error }) => {
      console.log("Player status:", status);
      if (error) {
        console.error("Player error:", error);
      }
    });

    return () => sub.remove();
  }, [player]);

  return (
    <View className="flex-1 w-full h-full bg-black justify-center relative">
      <StatusBar hidden />

      {/* TODO: create custom UI for video controls */}
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

      {/* Top overlay */}
      <View className="absolute top-0 left-0 right-0 px-4 py-2 flex-row items-center justify-between bg-black/50 pointer-events-box-none">
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

// NOTE: expo-video facing black screen problem in NativeWind styling
const styles = StyleSheet.create({
  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
