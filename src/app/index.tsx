import { Platform, Pressable, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import VideoList from "@/components/VideoList";

import ConfirmDialog from "@/components/dialogs/Confirm";
import { pickDir } from "@/services/folderPicker/picker";
import { loadDir, saveDir } from "@/services/storage/storage";
import { findVideos, getVideoUri } from "@/services/video/video";
import type { Dir, Video } from "@/types/video.type";
import { sortVideos } from "@/utils/sortVideos";
import { router } from "expo-router";
import { useState } from "react";
import styles from "./index.styles";

export default function App() {
  const [visible, setVisible] = useState<boolean>(true);

  const [playlist, setPlaylist] = useState<string>("");
  const [dir, setDir] = useState<Dir | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [selectedVideoIdx, setSelectedVideoIdx] = useState<number>(0);

  const selectVideos = async (fresh: boolean = false) => {
    try {
      setLoading(true);
      let dir: Dir;
      let playlistName: string;

      if (fresh) {
        dir = await pickDir();
        playlistName = "new_playlist";
      } else {
        const tempDir = await loadDir();

        if (!tempDir) {
          dir = await pickDir();
          playlistName = "new_playlist";
        } else {
          dir = tempDir.dir;
          playlistName = tempDir.playlist;
        }
      }

      setDir(dir);
      setPlaylist(playlistName);

      await saveDir(dir, playlistName);

      const videos = sortVideos(await findVideos(dir));
      setVideos(videos);
    } catch (error) {
      console.error(error);
      alert((error as Error).message || "Failed to select videos");
    } finally {
      setLoading(false);
    }
  };

  const openPlayer = async (index: number) => {
    try {
      if (!dir) return;

      const video = videos[index];
      if (!video) return;

      const uri = await getVideoUri(dir, video.name);
      if (!uri) return;

      // Open the video player
      setSelectedVideoIdx(index);
      router.push({
        pathname: "/player",
        params: { title: video.name, uri: encodeURIComponent(uri) },
      });
    } catch (error) {
      alert((error as Error).message || "Failed to open video player");
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {Platform.OS == "web" && (
            // solve web user interactivity issue for auto load dir
            // TODO: show when dir exist in storage
            // FIXME: load dir automatically without confirmation on android
            <ConfirmDialog
              message="Do you wanted to load previous session?"
              visible={visible}
              setVisible={setVisible}
              onConfirm={() => selectVideos(false)}
            />
          )}
          <Text style={styles.title}>{dir?.name}</Text>

          <View style={styles.topButtons}>
            <Pressable style={styles.button} onPress={() => selectVideos(true)}>
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
            <VideoList
              videos={videos}
              continueVideoIdx={selectedVideoIdx}
              play={openPlayer}
            />
          ) : (
            <Text>No videos found</Text>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
