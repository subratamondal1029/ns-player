import { Platform, Text, View } from "react-native";
import { VideoControlProps } from "./controls.types";

const VideoControls = ({}: VideoControlProps) => {
  return (
    <View className="w-full h-full flex-1 justify-center items-center">
      <Text className="text-center text-xl text-gray-200">
        Video Playback control not supported on {Platform.OS}
      </Text>
    </View>
  );
};

export default VideoControls;
