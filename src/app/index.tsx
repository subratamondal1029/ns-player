import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import VideoList from "@/components/VideoList";
import ConfirmDialog from "@/components/dialogs/Confirm";
import { pickDir } from "@/services/folderPicker/picker";
import { loadDir, saveDir } from "@/services/storage/storage";
import { findVideos, getVideoUri } from "@/services/video/video";
import type { Dir, Video } from "@/types/video.type";
import { decodePlaylistName } from "@/utils/playlistName";
import { sortVideos } from "@/utils/sortVideos";
import { router } from "expo-router";
import { useState } from "react";

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
        playlistName = "new-playlist";
      } else {
        const tempDir = await loadDir();

        if (!tempDir) {
          dir = await pickDir();
          playlistName = "new-playlist";
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
      <SafeAreaView className="flex-1 bg-neutral-950">
        <View className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-4">
          {Platform.OS === "web" && (
            <ConfirmDialog
              message="Do you want to load previous session?"
              visible={visible}
              setVisible={setVisible}
              onConfirm={() => selectVideos(false)}
            />
          )}

          {/* Header */}
          <View className="mb-6 items-center">
            <Text className="text-2xl sm:text-3xl font-bold text-neutral-100 text-center tracking-tight">
              {decodePlaylistName(playlist) || "NS Player"}
            </Text>
            {dir?.name ? (
              <Text className="text-xs sm:text-sm text-neutral-400 mt-1">
                {dir.name}
              </Text>
            ) : null}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-4">
            <Pressable
              onPress={() => selectVideos(true)}
              className="flex-1 py-3.5 px-4 rounded-xl bg-blue-600 active:bg-blue-500 items-center justify-center shadow-sm"
            >
              <Text className="text-white text-base font-semibold">Select Folder</Text>
            </Pressable>

            <Pressable
              onPress={() => selectVideos(false)}
              className="py-3.5 px-6 rounded-xl bg-neutral-900 border border-neutral-800 active:bg-neutral-800 items-center justify-center"
            >
              <Text className="text-neutral-200 text-base font-medium">Sync</Text>
            </Pressable>
          </View>

          {/* Quick Controls */}
          {videos.length > 0 && (
            <View className="flex-row gap-3 mb-5">
              <Pressable
                onPress={() => openPlayer(selectedVideoIdx)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 active:bg-neutral-700 items-center justify-center border border-neutral-700"
              >
                <Text className="text-neutral-100 text-sm font-semibold">Continue</Text>
              </Pressable>

              <Pressable
                onPress={() => openPlayer(0)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 active:bg-neutral-800 items-center justify-center border border-neutral-800"
              >
                <Text className="text-neutral-300 text-sm font-medium">Start Over</Text>
              </Pressable>
            </View>
          )}

          {/* Main Content */}
          <View className="flex-1">
            {loading ? (
              <View className="flex-1 items-center justify-center py-16 gap-3">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-neutral-400 text-sm font-medium">Loading playlist...</Text>
              </View>
            ) : videos.length > 0 ? (
              <VideoList
                videos={videos}
                continueVideoIdx={selectedVideoIdx}
                play={openPlayer}
              />
            ) : (
              <View className="flex-1 items-center justify-center py-16 border border-dashed border-neutral-800/80 rounded-2xl p-8 bg-neutral-900/20">
                <Text className="text-neutral-300 text-lg font-semibold mb-1">No videos loaded</Text>
                <Text className="text-neutral-500 text-sm text-center">
                  Select a folder containing video files to get started.
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
