import { SERVER_URL } from "@/constants";
import { useTimestamp } from "@/context/timestampContext";
import { loadTimestampState } from "@/services/storage/storage";
import { syncTimestamp } from "@/services/sync/sync";
import { Loader2 } from "lucide-react-native";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Image, Modal, Text, View } from "react-native";

const Sync = ({
  visible,
  setVisible,
  playlist,
}: {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  playlist: string;
}) => {
  const { resetTimestamp } = useTimestamp();
  const [uri, setUri] = useState<string>("");
  const [qrLoading, setQrLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const sseEvent = useRef<EventSource | null>(null);

  const onClose = () => {
    URL.revokeObjectURL(uri);
    setUri("");
    setVisible(false);
    if (sseEvent.current) {
      sseEvent.current.close();
      sseEvent.current = null;
    }
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
        setQrLoading(true);
        const uri = (await syncTimestamp()) as string;
        setUri(uri);
      } catch (error) {
        alert((error as Error).message || "Failed to fetch QR code");
        console.error(error);
      } finally {
        setQrLoading(false);
      }
    };

    if (visible && uri === "") {
      getImageUri();
    }
  }, [visible, uri]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onClose]);

  // SSE connection
  useEffect(() => {
    const connectSse = async () => {
      setLoading(true);
      const eventSource = new EventSource(`${SERVER_URL}/sync/sse`);
      sseEvent.current = eventSource;

      eventSource.addEventListener("sync", async (event) => {
        const update = (event as MessageEvent<string>).data === "true";

        eventSource.close();
        sseEvent.current = null;

        // Handle the boolean here
        if (update) {
          try {
            const timestamp = await loadTimestampState(playlist);
            resetTimestamp(timestamp);
          } catch (error) {
            console.log(error);
            alert((error as Error).message || "Failed to load timestamp state");
          }
        }

        setLoading(false);
        onClose();
      });

      eventSource.onerror = () => {
        console.error("SSE connection error");
        alert("SSE connection error");
        eventSource.close();
        setLoading(false);
        sseEvent.current = null;
      };
    };

    if (uri && sseEvent.current === null) {
      connectSse();
    }
    return () => {
      if (sseEvent.current) {
        sseEvent.current.close();
      }
    };
  }, [uri, playlist]);

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View className="flex-1 justify-center items-center bg-black/70 p-4">
        <View className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
          <Text className="text-lg font-medium text-neutral-100 text-center">
            Scan to get server url
          </Text>
          {qrLoading ? (
            <Loader2 color="#fff" size={28} className="animate-spin mx-auto" />
          ) : (
            <Image
              source={{ uri }}
              className="w-40 h-40 my-10 mx-auto bg-white"
            />
          )}

          {loading && (
            <Loader2 color="#fff" size={28} className="animate-spin mx-auto" />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default Sync;
