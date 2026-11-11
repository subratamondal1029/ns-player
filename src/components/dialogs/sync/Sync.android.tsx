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
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
    if (
      visible &&
      cameraPermission &&
      !cameraPermission.granted &&
      cameraPermission.canAskAgain
    ) {
      requestCameraPermission();
    }
  }, [
    visible,
    cameraPermission?.granted,
    cameraPermission?.canAskAgain,
    requestCameraPermission,
  ]);

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View className="flex-1 justify-center items-center bg-black/70 p-4">
        <View className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl overflow-hidden">
          {loading ? (
            <View className="h-72 w-full justify-center items-center">
              <ActivityIndicator color="#fff" size="large" />
            </View>
          ) : !cameraPermission?.granted ? (
            <View className="h-72 w-full justify-between items-center py-4">
              <View className="items-center gap-2">
                <Text className="text-xl font-medium text-neutral-100 text-center">
                  Camera Permission
                </Text>
                <Text className="text-base text-neutral-400 text-center px-2">
                  Camera access is required to scan the sync QR code.
                </Text>
              </View>

              <View className="flex-row justify-center items-center gap-3 w-full">
                <Pressable
                  onPress={onClose}
                  className="px-5 py-3 rounded-xl bg-neutral-800 active:bg-neutral-700"
                >
                  <Text className="text-base font-medium text-neutral-300">
                    Cancel
                  </Text>
                </Pressable>

                {cameraPermission?.canAskAgain ? (
                  <Pressable
                    onPress={requestCameraPermission}
                    className="px-5 py-3 rounded-xl bg-blue-600 active:bg-blue-500"
                  >
                    <Text className="text-base font-semibold text-white">
                      Grant Permission
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => Linking.openSettings()}
                    className="px-5 py-3 rounded-xl bg-blue-600 active:bg-blue-500"
                  >
                    <Text className="text-base font-semibold text-white">
                      Open Settings
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : url && scanned && !loading ? (
            <View className="h-72 w-full justify-between items-center py-4">
              <View className="items-center gap-2">
                <Text className="text-xl font-medium text-neutral-100 text-center">
                  Confirm Sync
                </Text>
                <Text className="text-base text-neutral-400 text-center px-2">
                  Sync timestamp for{" "}
                  <Text className="text-neutral-100 font-semibold">
                    {playlist || url}
                  </Text>
                  ?
                </Text>
              </View>

              <View className="flex-row justify-center items-center gap-3 w-full">
                <Pressable
                  onPress={onClose}
                  className="px-5 py-3 rounded-xl bg-neutral-800 active:bg-neutral-700"
                >
                  <Text className="text-base font-medium text-neutral-300">
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={synchronize}
                  className="px-5 py-3 rounded-xl bg-blue-600 active:bg-blue-500"
                >
                  <Text className="text-base font-semibold text-white">
                    Confirm
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="items-center w-full">
              <View
                style={{
                  width: 270,
                  height: 360,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: "#000",
                }}
              >
                <CameraView
                  style={{
                    width: 270,
                    height: 360,
                  }}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr"],
                  }}
                  onBarcodeScanned={handleScan}
                />
              </View>
              <Pressable
                onPress={onClose}
                className="mt-4 px-5 py-2.5 rounded-xl bg-neutral-800 active:bg-neutral-700"
              >
                <Text className="text-base font-medium text-neutral-300">
                  Cancel
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default Sync;
