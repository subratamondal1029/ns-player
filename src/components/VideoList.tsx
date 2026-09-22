import { Video } from "@/types/video.type";
import { ScrollView, Text, View } from "react-native";
import styles from "./videoList.styles";

type VideoListProps = {
  videos: Video[];
  continueVideoIdx: number;
};

export default function VideoList({
  videos,
  continueVideoIdx,
}: VideoListProps) {
  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      {videos.map((video, index) => (
        <View key={index} style={styles.videoItem}>
          <Text style={styles.videoTitle}>{video.name}</Text>

          {continueVideoIdx == index && (
            <>
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
