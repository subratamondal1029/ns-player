import { Pressable, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import VideoList from "@/components/VideoList";

import { pickDir } from "@/services/folderPicker/picker";
import { loadDir, saveDir } from "@/services/storage/storage";
import { findVideos } from "@/services/video/video";
import type { Video } from "@/types/video.type";
import { sortVideos } from "@/utils/sortVideos";
import { useState } from "react";
import styles from "./index.styles";

export default function App() {
  const [playlistName, setPlaylistName] = useState<string>("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVideoIdx, setSelectedVideoIdx] = useState<number>(0);

  const selectVideos = async () => {
    try {
      setLoading(true);
      let dir = await loadDir();

      if (!dir) {
        dir = await pickDir();
        // const playlistKey = prompt("Enter a name for the new playlist: "); //NOTE: test only
      }

      setPlaylistName(dir.name);
      await saveDir(dir);
      const videos = sortVideos(await findVideos(dir));
      setVideos(videos);
    } catch (error) {
      alert((error as Error).message || "Failed to select videos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{playlistName}</Text>

          <View style={styles.topButtons}>
            <Pressable style={styles.button} onPress={selectVideos}>
              <Text style={styles.buttonText}>select</Text>
            </Pressable>

            <Pressable style={[styles.button, styles.syncButton]}>
              <Text style={styles.buttonText}>sync</Text>
            </Pressable>
          </View>

          <View style={styles.actionButtons}>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionText}>continue</Text>
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Text style={styles.actionText}>start over</Text>
            </Pressable>
          </View>

          {loading ? (
            <Text>Loading playlist...</Text>
          ) : videos.length > 0 ? (
            <VideoList videos={videos} continueVideoIdx={selectedVideoIdx} />
          ) : (
            <Text>No videos found</Text>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
