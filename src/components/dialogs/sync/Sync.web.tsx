import { syncTimestamp } from "@/services/sync/sync";
import { Loader2 } from "lucide-react-native";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Image, Modal, Pressable, Text, View } from "react-native";

const Sync = ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}) => {
  const [uri, setUri] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const onClose = () => {
    URL.revokeObjectURL(uri);
    setUri("");
    setVisible(false);
  };

  //   cleanup uri
  useEffect(() => {
    return () => {
      if (uri) {
        URL.revokeObjectURL(uri);
      }
    };
  }, [uri]);

  // fetch qr uri
  useEffect(() => {
    const getImageUri = async () => {
      try {
        setLoading(true);
        const uri = (await syncTimestamp()) as string;
        setUri(uri);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    console.log(visible, uri);
    if (visible && uri === "") {
      getImageUri();
    }
  }, [visible, uri]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/70 p-4">
        <View className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
          {loading ? (
            <Loader2 color="#fff" size={28} className="animate-spin mx-auto" />
          ) : (
            <>
              <Text className="text-lg font-medium text-neutral-100 text-center">
                Scan to get server url
              </Text>

              <Image
                source={{ uri }}
                className="w-40 h-40 my-10 mx-auto bg-white"
              />

              <View className="flex-row justify-center gap-3">
                <Pressable
                  onPress={onClose}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 active:bg-blue-500"
                >
                  <Text className="text-sm font-semibold text-white">Done</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default Sync;
