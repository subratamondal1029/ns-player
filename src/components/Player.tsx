import formatTimestamp from "@/utils/formatTimestamp";
import Slider from "@react-native-community/slider";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Captions,
  CaptionsOff,
  ChevronLeft,
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

type VideoPlayerProps = {
  uri: string;
  title: string;
  playlist: string;
  timestamp: number;
  hasNext: boolean;
  hasPrevious: boolean;
  hasSubtitle: boolean;
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
  hasSubtitle,
  setTimestamp,
  onBack,
  hasNext,
  hasPrevious,
}: VideoPlayerProps) {
  const playerRef = useRef<View | null>(null);
  const videoRef = useRef<VideoView>(null);
  const intervalId = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [subtileEnabled, setSubtileEnabled] = useState<boolean>(false);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(50);

  const player = useVideoPlayer(uri);

  // timestamp update
  useEffect(() => {
    const playingChangeEvent = player.addListener("playingChange", (e) => {
      setIsPlaying(e.isPlaying);
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
        // player.play();
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
    <View
      className="flex-1 w-full h-full bg-black justify-center relative"
      ref={playerRef}
    >
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
          fullscreenOptions={{ enable: false }}
        />

        <View className="w-full h-full absolute top-0 left-0 right-0 items-center justify-between bg-black/50">
          {/* title & back */}
          <View className="flex-row items-center justify-between w-full h-14 px-4 sm:px-6 border border-blue-500">
            <Pressable
              onPress={onBack}
              hitSlop={12}
              className="w-10 h-10 items-center justify-center rounded-full active:bg-white/10"
            >
              <Text>
                <ChevronLeft color="#fff" size={28} />
              </Text>
            </Pressable>

            <Text
              className="flex-1 text-neutral-100 text-sm sm:text-base font-medium text-center tracking-wide px-2"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>

            <View className="w-10" />
          </View>

          {/* quick controls */}
          {/* TODO: make it modular for different platform */}
          <Pressable className="w-full flex-1 border border-red-600">
            <Text className="text-white text-base font-semibold text-center my-auto">
              Quick control no button
            </Text>
          </Pressable>

          {/* main controls */}
          <View className="w-full pb-4 pt-1 px-4 sm:px-8 border border-green-500 gap-2">
            {/* progress bar */}
            <View className="w-full flex-row items-center justify-between gap-3">
              <Text className="text-neutral-300 text-xs sm:text-sm font-mono min-w-[45px] text-right">
                {formatTimestamp(timestamp)}
              </Text>
              <Slider
                style={{
                  flex: 1,
                  width: "100%",
                  height: 24,
                  cursor: "pointer",
                }}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={progress}
                onValueChange={setProgress}
                tapToSeek
                minimumTrackTintColor="#3b82f6"
                maximumTrackTintColor="#52525b"
                thumbTintColor="#60a5fa"
                thumbSize={12}
              />
              <Text className="text-neutral-400 text-xs sm:text-sm font-mono min-w-[45px]">
                {formatTimestamp(player.duration)}
              </Text>
            </View>

            {/* controls buttons */}
            <View className="flex-row justify-between items-center px-2 sm:px-4">
              {/* Playback Controls */}
              <View className="flex-row items-center gap-3 sm:gap-5">
                <Pressable className="w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20 active:scale-95">
                  <Text>
                    {isPlaying ? (
                      <Pause color="#fff" size={22} />
                    ) : (
                      <Play color="#fff" size={22} />
                    )}
                  </Text>
                </Pressable>

                <Pressable
                  className="w-9 h-9 items-center justify-center rounded-full active:bg-white/10 active:scale-95"
                  disabled={!hasPrevious}
                >
                  <Text>
                    <SkipBack
                      color={hasPrevious ? "#fff" : "#52525b"}
                      size={22}
                    />
                  </Text>
                </Pressable>

                <Pressable
                  className="w-9 h-9 items-center justify-center rounded-full active:bg-white/10 active:scale-95"
                  disabled={!hasNext}
                >
                  <Text>
                    <SkipForward
                      color={hasNext ? "#fff" : "#52525b"}
                      size={22}
                    />
                  </Text>
                </Pressable>
              </View>

              {/* Utility Controls */}
              <View className="flex-row items-center gap-2 sm:gap-4">
                <Pressable
                  disabled={!hasSubtitle}
                  onPress={() => setSubtileEnabled((prev) => !prev)}
                  className="w-9 h-9 items-center justify-center rounded-full active:bg-white/10 active:scale-95"
                >
                  <Text>
                    {!hasSubtitle ? (
                      <CaptionsOff color="#52525b" size={22} />
                    ) : subtileEnabled ? (
                      <Captions color="#60a5fa" size={22} />
                    ) : (
                      <CaptionsOff color="#fff" size={22} />
                    )}
                  </Text>
                </Pressable>

                {Platform.OS === "web" && (
                  <Pressable
                    onPress={() => setFullScreen((prev) => !prev)}
                    className="w-9 h-9 items-center justify-center rounded-full active:bg-white/10 active:scale-95"
                  >
                    <Text>
                      {fullScreen ? (
                        <Minimize color="#fff" size={22} />
                      ) : (
                        <Maximize color="#fff" size={22} />
                      )}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
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
