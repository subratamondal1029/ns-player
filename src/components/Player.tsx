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
import { Pressable, StatusBar, StyleSheet, Text, View } from "react-native";

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
          <View className="w-full h-20 p-2 border border-green-500 justify-between">
            {/* progress bar */}
            <View className="w-full flex flex-row justify-between items-center gap-2 ">
              <Text className="text-gray-100 ">
                {formatTimestamp(timestamp)}
              </Text>
              <Slider
                style={{
                  flex: 1,
                  width: "100%",
                  height: 20,
                  cursor: "pointer",
                }}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={progress}
                onValueChange={setProgress}
                tapToSeek
                minimumTrackTintColor="#13a3eb" // played
                maximumTrackTintColor="#6b7280" // unplayed
                thumbTintColor="#3b82f6"
                thumbSize={0}
              />
              <Text className="text-gray-200 ">
                {formatTimestamp(player.duration)}{" "}
              </Text>
            </View>

            <View className="flex flex-row justify-between items-center mx-16">
              <View className="flex flex-row justify-start items-center gap-2">
                <Pressable className="mr-4">
                  <Text>
                    {isPlaying ? (
                      <Pause color="#fff" size={25} />
                    ) : (
                      <Play color="#fff" size={25} />
                    )}
                  </Text>
                </Pressable>

                <Pressable className="mr-2" disabled={!hasPrevious}>
                  <Text>
                    <SkipBack
                      color={hasPrevious ? "#fff" : "#6b7280"}
                      size={25}
                    />
                  </Text>
                </Pressable>

                <Pressable disabled={!hasNext}>
                  <Text>
                    <SkipForward
                      color={hasNext ? "#fff" : "#6b7280"}
                      size={25}
                    />
                  </Text>
                </Pressable>
              </View>
              <View className="flex flex-row justify-end items-center">
                <Pressable
                  disabled={!hasSubtitle}
                  onPress={() => setSubtileEnabled((prev) => !prev)}
                >
                  <Text>
                    {!hasSubtitle ? (
                      <CaptionsOff color="#6b7280" size={25} />
                    ) : subtileEnabled ? (
                      <Captions color="#fff" size={25} />
                    ) : (
                      <CaptionsOff color="#fff" size={25} />
                    )}
                  </Text>
                </Pressable>
                <Pressable onPress={() => setFullScreen((prev) => !prev)}>
                  <Text>
                    {fullScreen ? (
                      <Minimize color="#fff" size={25} />
                    ) : (
                      <Maximize color="#fff" size={25} />
                    )}{" "}
                  </Text>
                </Pressable>
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
