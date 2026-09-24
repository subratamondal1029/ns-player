import { Platform, Text, View } from "react-native";

type VideoPlayerProps = {
  uri: string;
  title: string;
  onBack: () => void;
};

export default function VideoPlayer({}: VideoPlayerProps) {
  return (
    <View className="flex-1 w-full h-full bg-black justify-center items-center">
      <Text className="text-white text-base font-semibold text-center">
        Video Player not support on {Platform.OS}
      </Text>
    </View>
  );
}
