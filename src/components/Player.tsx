import { VideoPlayerProps } from "@/types/player.types";
import formatTimestamp from "@/utils/formatTimestamp";
import { findSubtitle } from "@/utils/subtitleParser";
import Slider from "@react-native-community/slider";
import { useEvent, useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Captions,
  CaptionsOff,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Feedback from "./Feedback";
import QuickControl from "./quickControls/QuickControl";

const cleanUri = (uri: string) => {
  if (Platform.OS !== "web" || !uri) return;
  URL.revokeObjectURL(uri);
};

export default function VideoPlayer({
  video,
  hasNext,
  hasPrev,
  next,
  prev,
  onBack,
  updateHistory,
}: VideoPlayerProps) {
  const player = useVideoPlayer(video.uri);

  const [showControls, setShowControls] = useState<boolean>(true);
  const [readyVideo, setReadyVideo] = useState<boolean>(false);
  const [subtitle, setSubtitle] = useState<string>("");
  const [feedback, setFeedback] = useState<React.ReactNode | null>(null);
  const [timestamp, setTimestamp] = useState<number>(
    video.initialTimestamp || 0,
  );

  const playerRef = useRef<View | null>(null);
  const videoRef = useRef<VideoView>(null);
  const initialLoad = useRef<boolean>(false);
  const timestampIntervalId = useRef<number | null>(null);
  const controlsVisibleTimeout = useRef<number | null>(null);

  const seeking = useRef<boolean>(false);
  const seekTimeoutId = useRef<number | null>(null);
  const accumulatedTimestamp = useRef<number>(video.initialTimestamp || 0);
  const seekBaseTimestamp = useRef<number>(video.initialTimestamp || 0);
  const subtitleIntervalId = useRef<number | null>(null);
  const subtitleEnabled = useRef<boolean>(video.subtitle !== null);
  const feedbackTimeout = useRef<number | null>(null);
  const progress = useMemo(
    () => (player.duration > 0 ? (timestamp / player.duration) * 100 : 0),
    [timestamp, player.duration],
  );

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });
  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });

  const triggerFeedback = (node: React.ReactNode, duration = 800) => {
    if (feedbackTimeout.current !== null) {
      clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = null;
    }
    setFeedback(node);
    feedbackTimeout.current = setTimeout(() => {
      setFeedback(null);
      feedbackTimeout.current = null;
    }, duration);
  };

  useEventListener(player, "playToEnd", () => {
    if (hasNext) {
      next();
    } else {
      onBack();
    }
  });

  const handleControlToggle = (show: boolean) => {
    if (controlsVisibleTimeout.current !== null) {
      clearTimeout(controlsVisibleTimeout.current);
      controlsVisibleTimeout.current = null;
    }

    setShowControls(show);
    if (show && player.playing) {
      controlsVisibleTimeout.current = setTimeout(() => {
        setShowControls(false);
        controlsVisibleTimeout.current = null;
      }, 3000);
    }
  };

  const playPause = () => {
    if (!readyVideo) return;
    if (player.playing) {
      player.pause();
      setShowControls(true);
    } else {
      player.play();
      handleControlToggle(false);
    }

    const feedBackCom = player.playing ? (
      <Pause color="#fff" size={40} />
    ) : (
      <Play color="#fff" size={40} />
    );
    triggerFeedback(feedBackCom);
  };

  const toggleSubtitle = () => {
    if (!video.subtitle) return;
    subtitleEnabled.current = !subtitleEnabled.current;

    if (subtitleEnabled.current) {
      triggerFeedback(<Captions color="#fff" fill="transparent" size={40} />);
    } else {
      triggerFeedback(
        <CaptionsOff color="#fff" fill="transparent" size={40} />,
      );
    }
  };

  const updateSubtitle = (timestamp: number) => {
    if (!video.subtitle || !player.playing) return;
    if (subtitleEnabled.current) {
      setSubtitle(findSubtitle(video.subtitle, timestamp + 0.3));
    } else {
      setSubtitle("");
    }
  };

  const updateTimestampStates = (newTimestamp: number) => {
    setTimestamp(newTimestamp);
    updateHistory(newTimestamp);
    if (!seeking.current) {
      accumulatedTimestamp.current = newTimestamp;
    }
  };

  const seekTimestamp = (count: number, fwd: boolean = true) => {
    handleControlToggle(true);

    if (seekTimeoutId.current !== null) {
      clearTimeout(seekTimeoutId.current);
      seekTimeoutId.current = null;
    }

    if (!seeking.current) {
      seeking.current = true;
      seekBaseTimestamp.current = accumulatedTimestamp.current;
    }

    let newTimestamp: number;
    if (count === 0) {
      newTimestamp = 0;
    } else {
      if (fwd) {
        newTimestamp = Math.min(
          player.duration,
          accumulatedTimestamp.current + count,
        );
      } else {
        newTimestamp = Math.max(0, accumulatedTimestamp.current - count);
      }
    }

    accumulatedTimestamp.current = newTimestamp;
    updateTimestampStates(newTimestamp);

    if (count !== 0) {
      triggerFeedback(
        <SkipFeedback
          fwd={fwd}
          count={Math.abs(Math.floor(newTimestamp - seekBaseTimestamp.current))}
        />,
      );
    }

    seekTimeoutId.current = setTimeout(() => {
      seeking.current = false;
      player.currentTime = accumulatedTimestamp.current;
      handleControlToggle(false);
      seekTimeoutId.current = null;
    }, 500);
  };

  const onSeek = (value: number) => {
    if (!readyVideo) return;
    const newTimestamp = (value / 100) * player.duration;
    player.currentTime = newTimestamp;
    setTimestamp(newTimestamp);
  };

  // initial video load
  useEffect(() => {
    if (status === "readyToPlay" || player.status === "readyToPlay") {
      setReadyVideo(true);
      if (!initialLoad.current && video.initialTimestamp > 0) {
        player.currentTime = video.initialTimestamp;
        initialLoad.current = true;
      }
    } else if (status === "loading" || status === "idle") {
      setReadyVideo(false);
    }
  }, [status, video.initialTimestamp]);

  // timestamp tracker
  useEffect(() => {
    if (isPlaying) {
      if (timestampIntervalId.current === null) {
        timestampIntervalId.current = setInterval(() => {
          if (!seeking.current) {
            updateTimestampStates(player.currentTime);
          }
        }, 1000);
      }

      if (subtitleEnabled.current && subtitleIntervalId.current === null) {
        subtitleIntervalId.current = setInterval(() => {
          if (!seeking.current) {
            updateSubtitle(player.currentTime);
          }
        }, 500);
      }
    } else {
      if (timestampIntervalId.current !== null) {
        clearInterval(timestampIntervalId.current);
        timestampIntervalId.current = null;
        if (!seeking.current) {
          updateTimestampStates(player.currentTime);
        }
      }

      if (subtitleIntervalId.current !== null) {
        clearInterval(subtitleIntervalId.current);
        subtitleIntervalId.current = null;
      }
    }

    return () => {
      if (timestampIntervalId.current !== null) {
        clearInterval(timestampIntervalId.current);
        timestampIntervalId.current = null;
      }
      if (subtitleIntervalId.current !== null) {
        clearInterval(subtitleIntervalId.current);
        subtitleIntervalId.current = null;
      }
    };
  }, [isPlaying, player]);

  // uri cleanup
  useEffect(() => {
    return () => {
      cleanUri(video.uri);
    };
  }, [video.uri]);

  return (
    <Pressable
      className={`flex-1 w-full h-full bg-black justify-center relative outline-none focus:outline-none ${showControls ? "cursor-default" : "cursor-none"}`}
      ref={playerRef}
      {...(Platform.OS === "web"
        ? {
            onPointerMove: () => handleControlToggle(true),
            onPointerLeave: () => handleControlToggle(false),
          }
        : {
            onPress: () => handleControlToggle(true),
          })}
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
        <Feedback>{feedback}</Feedback>

        {subtitle?.trim() ? (
          <View
            pointerEvents="none"
            className="absolute bottom-6 sm:bottom-12 md:bottom-20 lg:bottom-24 w-full px-4 items-center justify-center z-10"
          >
            <Text className="max-w-[85%] sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-black/80 text-white font-medium text-center text-xs sm:text-sm md:text-base lg:text-lg px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded leading-snug">
              {subtitle.trim()}
            </Text>
          </View>
        ) : null}

        <View
          className={`w-full h-full absolute top-0 left-0 right-0 items-center justify-between bg-black/50 z-30 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {readyVideo ? (
            <>
              {/* title & back */}
              <View className="flex-row items-center justify-between w-full h-14 px-4 sm:px-6">
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
                  {video.title}
                </Text>

                <View className="w-10" />
              </View>

              {/* quick controls */}
              <QuickControl
                onNext={next}
                onPrev={prev}
                playPause={playPause}
                subtitleToggle={toggleSubtitle}
                updateTimestamp={seekTimestamp}
              />

              {/* main controls */}
              <View className="w-full pb-4 pt-1 px-4 sm:px-8 gap-2">
                {/* progress bar */}
                <View className="w-full flex-row items-center justify-between gap-3">
                  <Text className="text-neutral-300 text-xs sm:text-sm font-medium min-w-[45px] text-right">
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
                    onValueChange={onSeek}
                    tapToSeek
                    minimumTrackTintColor="#3b82f6"
                    maximumTrackTintColor="#d5dbe8"
                    thumbTintColor="#60a5fa"
                    thumbSize={12}
                  />
                  <Text className="text-neutral-300 text-xs sm:text-sm font-medium min-w-[45px]">
                    {formatTimestamp(player.duration || 0)}
                  </Text>
                </View>

                {/* controls buttons */}
                <View className="flex-row justify-between items-center px-2 sm:px-4">
                  {/* Playback Controls */}
                  <View className="flex-row items-center gap-3 sm:gap-5">
                    <Pressable
                      className="w-10 h-10 items-center justify-center rounded-full bg-white/10 active:bg-white/20 active:scale-95"
                      onPress={playPause}
                    >
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
                      disabled={!hasPrev}
                      onPress={prev}
                    >
                      <Text>
                        <SkipBack
                          color={hasPrev ? "#fff" : "#52525b"}
                          size={22}
                        />
                      </Text>
                    </Pressable>

                    <Pressable
                      className="w-9 h-9 items-center justify-center rounded-full active:bg-white/10 active:scale-95"
                      disabled={!hasNext}
                      onPress={next}
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
                      disabled={video.subtitle === null}
                      onPress={toggleSubtitle}
                      className="w-9 h-9 items-center justify-center rounded-full active:bg-white/10 active:scale-95"
                    >
                      <Text>
                        {video.subtitle === null ? (
                          <CaptionsOff color="#52525b" size={22} />
                        ) : subtitleEnabled.current ? (
                          <Captions color="#60a5fa" size={22} />
                        ) : (
                          <CaptionsOff color="#fff" size={22} />
                        )}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View className="flex justify-center items-center w-full h-full">
              <ActivityIndicator
                size="large"
                color="#fff"
                className="scale-150"
              />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// expo-video black screen issue in React Native Wind resolve
const styles = StyleSheet.create({
  video: { width: "100%", height: "100%" },
});

const SkipFeedback = ({ fwd, count }: { fwd: boolean; count: number }) => {
  return (
    <View className="flex-row justify-center items-center gap-1">
      {!fwd && <ChevronsLeft color="#fff" size={24} />}
      <Text className="text-white text-base font-bold">{count}s</Text>
      {fwd && <ChevronsRight color="#fff" size={24} />}
    </View>
  );
};
