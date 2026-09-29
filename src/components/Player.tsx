import { useVideoPlayer, VideoView } from "expo-video";
import { ChevronLeft, Circle } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
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

  const [progress, setProgress] = useState<number>(50);

  const player = useVideoPlayer(uri);

  // timestamp update
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

      <View className="w-full h-full flex-1 justify-center items-center relative">
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

        <View className="w-full h-full absolute top-0 left-0 right-0 items-center justify-between bg-black/50">
          {/* title & back */}
          <View className="flex-row items-center justify-between w-full h-12 pl-10 border border-blue-500">
            <Pressable
              onPress={onBack}
              hitSlop={12}
              className="w-10 items-start"
            >
              <ChevronLeft color="#fff" size={28} />
            </Pressable>

            <Text
              className="flex-1 text-white text-base font-semibold text-center"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </View>

          {/* quick controls */}
          {/* TODO: make it modular for different platform */}
          <Pressable className="w-full flex-1 border border-red-600">
            <Text className="text-white text-base font-semibold text-center my-auto">
              Quick control no button
            </Text>
          </Pressable>

          {/* main controls */}
          <View className="w-full h-20 border border-green-500 justify-center">
            {/* progress bar */}
            <View className="w-full relative items-center justify-center py-2">
              <Pressable
                id="bar"
                // onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
                className="w-11/12 h-1.5 bg-neutral-700 rounded-full relative justify-center"
              >
                {/* filled progress */}
                <View
                  id="progress"
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />

                {/* scrubber thumb */}
                <View
                  className="absolute -top-[5px] -ml-2 pointer-events-none"
                  style={{ left: `${progress}%` }}
                >
                  <Circle color="#fff" fill="#3b82f6" size={16} />
                </View>
              </Pressable>
            </View>

            <View>{/* controls */}</View>
          </View>
        </View>
      </View>
    </View>
  );
}

// expo-video black screen issue in React Native Wind resolve
const styles = StyleSheet.create({
  video: { width: "100%", height: "100%" },
});
