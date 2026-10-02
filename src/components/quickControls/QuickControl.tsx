import { QuickControlProps } from "@/types/player.types";
import { Platform, Text, View } from "react-native";

const QuickControl = ({}:QuickControlProps) => {
  return (
    <View className="w-full flex-1 border border-red-600">
      <Text className="text-white text-base font-semibold text-center my-auto">
        Not Implemented on ({Platform.OS})
      </Text>
    </View>
  );
};

export default QuickControl;
