import { useTimestamp } from "@/context/timestampContext";
import { saveTimestampState } from "@/services/storage/storage";
import { syncTimestamp } from "@/services/sync/sync";
import { Timestamp } from "@/types/timestamp.types";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

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
  const [loading, setLoading] = useState<boolean>(true);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const onClose = () => {
    setScanned(false);
    setUrl("");
    setVisible(false);
  };

  const synchronize = useCallback(async () => {
    try {
      setLoading(true);
      if (!rawTimestamp) {
        throw new Error("No timestamp available to sync");
      }

      const timestamp = (await syncTimestamp(
        rawTimestamp,
        url,
      )) as Timestamp | null;

      if (timestamp) {
        resetTimestamp(timestamp);
        await saveTimestampState(timestamp);
      }
    } catch (error) {
      console.error(error, (error as Error).cause);
      alert((error as Error).message || "Failed to sync timestamp");
    } finally {
      onClose();
      setLoading(false);
    }
  }, [url, rawTimestamp, resetTimestamp]);

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
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View className="flex-1 justify-center items-center bg-black/70 p-4">
        <View className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
          {loading ? (
            <View className="h-36 flex-1 justify-center items-center">
              <ActivityIndicator
                color="#fff"
                size="large"
                className="mx-auto"
              />
            </View>
          ) : url && scanned && !loading ? (
            <View className="h-36 flex flex-col justify-between items-center">
              <Text className="text-gray-200 text-xl text-center">
                Sync{" "}
                <Text className="text-gray-100 font-semibold">{playlist}</Text>
              </Text>
              <View className="flex-row justify-center items-center gap-3">
                <Pressable
                  onPress={synchronize}
                  className="w-full max-w-28 px-4 py-4 rounded-xl bg-blue-600 active:bg-blue-500 text-center"
                >
                  <Text className="text-sm font-semibold text-white text-center">
                    Confirm
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="w-full h-80 rounded-xl overflow-hidden bg-black relative">
              <CameraView
                style={{ width: "100%", height: "100%" }}
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
