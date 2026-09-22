import { useLocalSearchParams } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import styles from "./player.styles";

type PlayerParams = {
  title: string;
  uri: string;
  //   use context for timestamp state
};

const player = () => {
  const { title, uri } = useLocalSearchParams<PlayerParams>();
  const pl = useVideoPlayer(uri);

  return (
    <VideoView
      player={pl}
      nativeControls
      allowsPictureInPicture
      style={styles.video}
    />
  );
};

export default player;
