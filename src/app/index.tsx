import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import VideoList from "@/components/VideoList";
import ConfirmDialog from "@/components/dialogs/Confirm";
import UploadDialog from "@/components/dialogs/Upload";
import { useTimestamp } from "@/context/timestampContext";
import { useVideo } from "@/context/videoContext";
import { loadDir, saveDir } from "@/services/storage/storage";
import { findVideos } from "@/services/video/video";
import type { Dir } from "@/types/video.type";
import { decodePlaylistName } from "@/utils/playlistName";
import { sortVideos } from "@/utils/sortVideos";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export default function App() {
  const [visible, setVisible] = useState<boolean>(true);
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const [playlist, setPlaylist] = useState<string>("");
  const [dir, setDir] = useState<Dir | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { videos, setVideos, currentVideoIdx, playNow } = useVideo();
  const { lastPlayedVideoIdx } = useTimestamp();

  const loadVideos = async (dir: Dir, playlist: string) => {
    try {
      setLoading(true);
      const videos = sortVideos(await findVideos(dir));
      setVideos(videos);
      const lastPlayedVideo = lastPlayedVideoIdx(playlist);
      if (lastPlayedVideo !== -1) {
        playNow(lastPlayedVideo);
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: (error as Error).message || "Failed to get videos",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExistingDir = async () => {
    try {
      const dirData = await loadDir();
      if (!dirData) return;

      setDir(dirData.dir);
      setPlaylist(dirData.playlist);
      loadVideos(dirData.dir, dirData.playlist);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: (error as Error).message || "Failed to load existing directory",
      });
    }
  };

  const handleUpload = async (dir: Dir, playlist: string) => {
    try {
      await saveDir(dir, playlist);
      setDir(dir);
      setPlaylist(playlist);
      loadVideos(dir, playlist);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: (error as Error).message || "Failed to upload videos",
      });
    }
  };

  const openPlayer = async (index: number) => {
    try {
      if (!dir) return;

      const video = videos[index];
      if (!video) return;

      // Open the video player
      playNow(index);
      router.push("/player");
    } catch (error) {
      alert((error as Error).message || "Failed to open video player");
    }
  };

  useEffect(() => {
    if (Platform.OS !== "web") {
      loadExistingDir();
    }
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-neutral-950">
        <View className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-4">
          {Platform.OS === "web" && (
            <ConfirmDialog
              message="Do you want to load previous session?"
              visible={visible}
              setVisible={setVisible}
              onConfirm={loadExistingDir}
            />
          )}

          <UploadDialog
            visible={showPicker}
            setVisible={setShowPicker}
            upload={handleUpload}
          />

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
              onPress={() => setShowPicker(true)}
              className="flex-1 py-3.5 px-4 rounded-xl bg-blue-600 active:bg-blue-500 items-center justify-center shadow-sm"
            >
              <Text className="text-white text-base font-semibold">
                Select Folder
              </Text>
            </Pressable>

            <Pressable
              // onPress={() => selectVideos(false)}
              className="py-3.5 px-6 rounded-xl bg-neutral-900 border border-neutral-800 active:bg-neutral-800 items-center justify-center"
            >
              <Text className="text-neutral-200 text-base font-medium">
                Sync
              </Text>
            </Pressable>
          </View>

          {/* Quick Controls */}
          {videos.length > 0 && (
            <View className="flex-row gap-3 mb-5">
              <Pressable
                onPress={() => openPlayer(currentVideoIdx)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 active:bg-neutral-700 items-center justify-center border border-neutral-700"
              >
                <Text className="text-neutral-100 text-sm font-semibold">
                  Continue
                </Text>
              </Pressable>

              <Pressable
                onPress={() => openPlayer(0)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-900 active:bg-neutral-800 items-center justify-center border border-neutral-800"
              >
                <Text className="text-neutral-300 text-sm font-medium">
                  Start Over
                </Text>
              </Pressable>
            </View>
          )}

          {/* Main Content */}
          <View className="flex-1">
            {loading ? (
              <View className="flex-1 items-center justify-center py-16 gap-3">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-neutral-400 text-sm font-medium">
                  Loading playlist...
                </Text>
              </View>
            ) : videos.length > 0 ? (
              <VideoList
                videos={videos}
                continueVideoIdx={currentVideoIdx}
                play={openPlayer}
              />
            ) : (
              <View className="flex-1 items-center justify-center py-16 border border-dashed border-neutral-800/80 rounded-2xl p-8 bg-neutral-900/20">
                <Text className="text-neutral-300 text-lg font-semibold mb-1">
                  No videos loaded
                </Text>
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
