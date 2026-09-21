import { ScrollView, Text, View } from "react-native";
import styles from "./videoList.styles";

const videos = ["Video title comes here...", "", "", "", "", "", ""];

export default function VideoList() {
  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      {videos.map((video, index) => (
        <View key={index} style={styles.videoItem}>
          {index === 0 && (
            <>
              <Text style={styles.videoTitle}>{video}</Text>

              <View style={styles.progressCircle}>
                <View style={styles.progressCircleInner} />
              </View>

              <View style={styles.progressTrack}>
                <View style={styles.progress} />
              </View>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
