import { useVideoPlayer, VideoView } from "expo-video";
import { useRef } from "react";
import { Pressable, StatusBar, Text, View } from "react-native";

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

  const player = useVideoPlayer(uri, (player) => {
    player.play();
  });

  return (
    <View className="flex-1 w-full h-full bg-black justify-center relative">
      <StatusBar hidden />

      {/* TODO: create custom UI for video controls */}
      <VideoView
        ref={videoRef}
        className="w-full h-full"
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

        <Text className="flex-1 text-white text-base font-semibold text-center" numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>

        <View className="w-10" />
      </View>
    </View>
  );
}
