import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as ScreenOrientation from "expo-screen-orientation";

import VideoPlayer from "@/components/player/Player";
import styles from "./player.styles";

type PlayerParams = {
  title: string;
  uri: string;
  //   use context for timestamp state
};

const player = () => {
  const { title, uri } = useLocalSearchParams<PlayerParams>();

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
    <SafeAreaView style={styles.safeArea}>
      <VideoPlayer title={title} uri={uri} onBack={backToList} />
    </SafeAreaView>
  );
};

export default player;
