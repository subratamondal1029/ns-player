import { Platform, Text, View } from "react-native";
import styles from "./player.styles";

type VideoPlayerProps = {
  uri: string;
  title: string;
  onBack: () => void;
};

export default function VideoPlayer({}: VideoPlayerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Video Player not support on {Platform.OS}
      </Text>
    </View>
  );
}
