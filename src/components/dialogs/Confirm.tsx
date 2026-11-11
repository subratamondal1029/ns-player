import { Dispatch, SetStateAction } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type ConfirmDialogProps = {
  message: string;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onCancel?: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  message,
  visible,
  setVisible,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    setVisible(false);
    onConfirm();
  };

  const handleCancel = () => {
    setVisible(false);
    onCancel?.();
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleCancel}
      animationType="fade"
    >
      <View className="flex-1 justify-center items-center bg-black/70 p-4">
        <View className="w-full max-w-sm rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl">
          <Text className="text-lg font-medium text-neutral-100 mb-6 text-center">
            {message}
          </Text>

          <View className="flex-row justify-end gap-3">
            {/* reverse order for make Confirm button fucus first on mount without using JS */}
            <Pressable
              focusable={true}
              onPress={handleConfirm}
              className="order-2 px-4 py-2.5 rounded-xl bg-blue-600 active:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              <Text className="text-sm font-semibold text-white">Confirm</Text>
            </Pressable>

            <Pressable
              focusable={true}
              onPress={handleCancel}
              className="order-1 px-4 py-2.5 rounded-xl bg-neutral-800 active:bg-neutral-700 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              <Text className="text-sm font-medium text-neutral-300">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
