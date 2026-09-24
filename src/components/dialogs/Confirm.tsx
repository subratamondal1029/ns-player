import { Modal, Platform, Pressable, Text, View } from "react-native";
import styles from "./dialog.styles";

type ConfirmDialogProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  visible,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    if (Platform.OS === "web") {
      console.log("Is app ready", navigator.userActivation?.isActive);
    }

    onConfirm();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Are you sure?</Text>

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.button}>
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
