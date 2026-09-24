import { useLocalSearchParams } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as ScreenOrientation from "expo-screen-orientation";

import styles from "./player.styles";

type PlayerParams = {
  title: string;
  uri: string;
  //   use context for timestamp state
};

const player = () => {
  const { title, uri } = useLocalSearchParams<PlayerParams>();
  const pl = useVideoPlayer(uri);

  useEffect(() => {
    return () => {
      if (Platform.OS === "web") {
        console.log("Releasing video URI: " + uri);
        URL.revokeObjectURL(uri);
      }
    };
  }, [uri]);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>

        <VideoView
          player={pl}
          nativeControls
          allowsPictureInPicture
          style={styles.video}
        />
      </View>
    </SafeAreaView>
  );
};

export default player;
