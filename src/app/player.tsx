import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as ScreenOrientation from "expo-screen-orientation";

import VideoPlayer from "@/components/player/Player";
import { useVideo } from "@/context/videoContext";
import { loadDir } from "@/services/storage/storage";
import { getVideoUri } from "@/services/video/video";
import { Video } from "@/types/video.type";

const player = () => {
  const { videos, currentVideoIdx } = useVideo();
  const [video, setVideo] = useState<Video | null>(null);
  const [uri, setUri] = useState<string>("");

  const backToList = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    return () => {
      if (Platform.OS === "web") {
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

      if (Platform.OS === "web" && uri) {
        URL.revokeObjectURL(uri);
      }

      setVideo(currentVideo);
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

  return (
    <SafeAreaView className="flex-1 bg-black">
      {video && uri && (
        <VideoPlayer title={video.name} uri={uri} onBack={backToList} />
      )}
    </SafeAreaView>
  );
};

export default player;
