import { Dispatch, SetStateAction } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import styles from "./dialog.styles";

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
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{message}</Text>

          <View style={styles.actions}>
            <Pressable onPress={handleCancel} style={styles.button}>
              <Text>Cancel</Text>
            </Pressable>

            <Pressable onPress={handleConfirm} style={styles.button}>
              <Text>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
