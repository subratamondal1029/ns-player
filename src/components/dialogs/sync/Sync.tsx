import { Dispatch, SetStateAction } from "react";
import { Platform, Text, View } from "react-native";

const Sync = ({}: {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  playlist: string
}) => {
  return (
    <View className="w-full h-full flex items-center justify-center">
      <Text>Sync Does not support on ${Platform.OS}</Text>
    </View>
  );
};

export default Sync;
