import { useVideoPlayer, VideoView } from "expo-video";
import { useRef } from "react";
import { Pressable, StatusBar, Text, View } from "react-native";

import styles from "./player.styles";

type VideoPlayerProps = {
  uri: string;
  title: string;
  onBack: () => void;
};

export default function VideoPlayer({ uri, title, onBack }: VideoPlayerProps) {
  const videoRef = useRef<VideoView>(null);

  const player = useVideoPlayer(uri, (player) => {
    player.play();
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* TODO: create custom UI for video controls */}
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

      {/* Top overlay */}
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>

        <View style={styles.rightSpacer} />
      </View>
    </View>
  );
}
