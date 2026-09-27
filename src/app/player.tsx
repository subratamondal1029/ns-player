import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as ScreenOrientation from "expo-screen-orientation";

import VideoPlayer from "@/components/Player";
import { useTimestamp } from "@/context/timestampContext";
import { useVideo } from "@/context/videoContext";
import { loadDir } from "@/services/storage/storage";
import { getVideoUri } from "@/services/video/video";
import { Video } from "@/types/video.type";

const player = () => {
  const { videos, currentVideoIdx, hasNext, hasPrev, next, prev } = useVideo();
  const { getTimestamp, setTimestamp: saveTimestamp } = useTimestamp();
  const [video, setVideo] = useState<Video | null>(null);
  const [playlist, setPlaylist] = useState<string>("");
  const [uri, setUri] = useState<string>("");
  const [timestamp, setTimestamp] = useState<number>(0);

  const backToList = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    return () => {
      if (Platform.OS === "web" && uri) {
        console.log("Releasing video URI: " + uri);
        URL.revokeObjectURL(uri);
      }
    };
  }, [uri]);

  useEffect(() => {
    const loadVideo = async () => {
      const currentVideo = videos[currentVideoIdx];

      const dir = await loadDir();
      if (!dir) return;

      const playbackUri = await getVideoUri(dir.dir, currentVideo.name);
      if (!playbackUri) return;

      const timestamp = getTimestamp(dir.playlist, currentVideoIdx);

      if (Platform.OS === "web" && uri) {
        URL.revokeObjectURL(uri);
      }

      setTimestamp(timestamp);
      setVideo(currentVideo);
      setPlaylist(dir.playlist);
      setUri(playbackUri);
    };

    if (currentVideoIdx !== -1) {
      loadVideo();
    }
  }, [currentVideoIdx]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }

    return () => {
      if (Platform.OS !== "web") {
        ScreenOrientation.unlockAsync();
      }
    };
  }, []);

  const handleTimestampChange = (timestamp: number) => {
    saveTimestamp(playlist, currentVideoIdx, timestamp);
  };

  const onVolumeChange = (volume: number) => {
    console.log(`OnVolumeChange :: ${volume}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {video && uri && (
        <VideoPlayer
          title={video.name}
          playlist={playlist}
          uri={uri}
          timestamp={timestamp}
          hasNext={hasNext()}
          hasPrevious={hasPrev()}
          setTimestamp={handleTimestampChange}
          onBack={backToList}
          onVolumeChange={onVolumeChange}
          onPrevious={prev}
          onNext={next}
        />
      )}
    </SafeAreaView>
  );
};

export default player;
