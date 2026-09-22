import { Video } from "@/types/video.type";
import { Pressable, ScrollView, Text, View } from "react-native";
import styles from "./videoList.styles";

type VideoListProps = {
  videos: Video[];
  continueVideoIdx: number;
  play(index: number): void;
};

export default function VideoList({
  videos,
  continueVideoIdx,
  play,
}: VideoListProps) {
  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      {videos.map((video, index) => (
        <Pressable key={index} style={styles.videoItem} onPress={() => play(index)}>
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
        </Pressable>
      ))}
    </ScrollView>
  );
}
