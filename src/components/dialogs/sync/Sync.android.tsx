import { useTimestamp } from "@/context/timestampContext";
import { syncTimestamp } from "@/services/sync/sync";
import { Timestamp } from "@/types/timestamp.types";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { Loader2 } from "lucide-react-native";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

const Sync = ({
  visible,
  setVisible,
  playlist,
}: {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  playlist: string;
}) => {
  const { rawTimestamp, resetTimestamp } = useTimestamp();
  const [scanned, setScanned] = useState<boolean>(false);
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const onClose = () => {
    setScanned(false);
    setUrl("");
    setVisible(false);
  };

  const fetchTimestamp = async () => {
    try {
      setLoading(true);
      if (!rawTimestamp) {
        throw new Error("No timestamp available to sync");
      }

      const timestamp = (await syncTimestamp(
        rawTimestamp,
        url,
      )) as Timestamp | null;
      if (timestamp === null) {
        alert("Already Synchronized");
        return;
      }

      if (timestamp && timestamp.playlist === playlist) {
        resetTimestamp(timestamp);
      }
    } catch (error) {
      console.error(error, (error as Error).cause);
      alert((error as Error).message || "Failed to sync timestamp");
    } finally {
      onClose();
      setLoading(false);
    }
  };

  const handleScan = ({ data }: BarcodeScanningResult) => {
    setUrl(data);
    setScanned(true);
  };

  useEffect(() => {
    if (cameraPermission && !cameraPermission.granted) {
      setLoading(true);
      requestCameraPermission();
    } else if (cameraPermission && cameraPermission.granted) {
      setLoading(false);
    }
  }, [cameraPermission]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/70 p-4">
        <View className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
          {loading ? (
            <Loader2 color="#fff" size={28} className="animate-spin mx-auto" />
          ) : url && scanned && !loading ? (
            <View className="flex-col justify-center items-center gap-3">
              <Text className="text-lg font-medium text-neutral-100 text-center">
                {url}
              </Text>
              <Pressable
                onPress={fetchTimestamp}
                className="w-full max-w-24 px-4 py-2.5 rounded-xl bg-blue-600 active:bg-blue-500 text-center"
              >
                <Text className="text-sm font-semibold text-white">
                  Confirm
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-1 w-full h-[400px]">
              <CameraView
                style={{ flex: 1, width: "100%" }}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={handleScan}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default Sync;
