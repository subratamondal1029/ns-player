import { pickDir } from "@/services/folderPicker/picker";
import { Dir } from "@/types/video.type";
import { Check } from "lucide-react-native";
import { Dispatch, SetStateAction, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

type UploadDialogProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  upload: (dir: Dir, playlist: string) => void;
};

const UploadDialog = ({ visible, setVisible, upload }: UploadDialogProps) => {
  const [playlist, setPlaylist] = useState("");
  const [dir, setDir] = useState<Dir | null>(null);
  const [error, setError] = useState("");

  const handleCancel = () => {
    setError("");
    setDir(null);
    setPlaylist("");
    setVisible(false);
  };

  const handleConfirm = () => {
    if (playlist && dir) {
      upload(dir, playlist);

      setPlaylist("");
      setDir(null);
      setVisible(false);
    } else {
      setError("Please fill in all fields");
    }
  };

  const handlePickPlaylist = async () => {
    try {
      setError("");
      const dir = await pickDir();
      setDir(dir);
      if (playlist === "") {
        setPlaylist(dir.name);
      }
    } catch (error) {
      setError((error as Error).message || "Failed to pick playlist");
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/70 p-4">
        <View className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl gap-5">
          <Text className="text-lg font-semibold text-neutral-100">
            Upload Playlist
          </Text>

          {/* Playlist Input */}
          <View className="gap-2 w-full">
            <Text className="text-sm font-medium text-neutral-300">
              Playlist Name
            </Text>

            <TextInput
              value={playlist}
              onChangeText={setPlaylist}
              placeholder="new-playlist"
              placeholderTextColor="#737373"
              autoCapitalize="none"
              className="w-full bg-neutral-950/80 text-neutral-100 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm"
            />
          </View>

          {/* Pick Playlist Button */}
          <View className="gap-2 w-full">
            <Pressable
              onPress={handlePickPlaylist}
              className="w-full py-3 px-4 rounded-xl bg-neutral-800/80 border border-neutral-700/60 active:bg-neutral-700 flex-row items-center justify-center gap-2"
            >
              <Text className="text-sm font-medium text-neutral-200">
                Pick Playlist Folder
              </Text>
              {dir !== null && (
                <Check size={18} color="#22c55e" strokeWidth={2.5} />
              )}
            </Pressable>
          </View>

          {error ? <Text className="text-xs text-red-400">{error}</Text> : null}

          {/* Actions */}
          <View className="flex-row justify-end gap-3 pt-2">
            <Pressable
              onPress={handleCancel}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 active:bg-neutral-700"
            >
              <Text className="text-sm font-medium text-neutral-300">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleConfirm}
              className="px-4 py-2.5 rounded-xl bg-blue-600 active:bg-blue-500"
            >
              <Text className="text-sm font-semibold text-white">Upload</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UploadDialog;
