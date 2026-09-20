import folderPicker from "@/services/folderPicker/picker";
import type { Video } from "@/types/video.type";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const selectVideos = async (freshPick: boolean = false) => {
    try {
      setLoading(true);
      const selectedVideos = await folderPicker(freshPick);
      setVideos(selectedVideos);
    } catch (error) {
      console.error(error);
      alert((error as Error)?.message || "Videos Selection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    selectVideos(false);
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Select Videos" onPress={() => selectVideos(true)} />
      <View style={styles.videoList}>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          videos.map((video, idx) => <Text key={idx}>{video.name}</Text>)
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  videoList: {
    width: "100%",
    padding: 10,
    flex: 1,
    flexDirection: "column",
    gap: 10,
  },
});
