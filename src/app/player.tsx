import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NavigationBar } from "expo-navigation-bar";
import * as ScreenOrientation from "expo-screen-orientation";

import VideoPlayer from "@/components/Player";
import { useTimestamp } from "@/context/timestampContext";
import { useVideo } from "@/context/videoContext";
import { loadDir } from "@/services/storage/storage";
import { getVideoUri } from "@/services/video/video";
import { PlayerVideo } from "@/types/player.types";

const player = () => {
  const { videos, currentVideoIdx, hasNext, hasPrev, next, prev } = useVideo();
  const { getTimestamp, setTimestamp: saveTimestamp } = useTimestamp();
  const [video, setVideo] = useState<PlayerVideo | null>(null);
  const [playlist, setPlaylist] = useState<string>("");

  const backToList = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const loadVideo = async () => {
      const currentVideo = videos[currentVideoIdx];

      const dir = await loadDir();
      if (!dir) return;

      const playbackUri = await getVideoUri(dir.dir, currentVideo.name);
      if (!playbackUri) return;

      const timestamp = getTimestamp(dir.playlist, currentVideoIdx);

      setPlaylist(dir.playlist);
      setVideo({
        title: currentVideo.name,
        uri: playbackUri,
        initialTimestamp: timestamp,
        subtitle: null, //TODO: get subtitle then set
      });
    };

    if (currentVideoIdx !== -1) {
      loadVideo();
    }
  }, [currentVideoIdx]);

  useEffect(() => {
    if (Platform.OS === "android") {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      NavigationBar.setHidden(true);
    }

    return () => {
      if (Platform.OS === "android") {
        ScreenOrientation.unlockAsync();
        NavigationBar.setHidden(false);
      }
    };
  }, []);

  const handleTimestampChange = (timestamp: number) => {
    saveTimestamp(playlist, currentVideoIdx, timestamp);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {video && (
        <VideoPlayer
          key={video.uri}
          video={video}
          hasNext={hasNext()}
          hasPrev={hasPrev()}
          onBack={backToList}
          next={next}
          prev={prev}
          updateHistory={handleTimestampChange}
        />
      )}
    </SafeAreaView>
  );
};

export default player;
