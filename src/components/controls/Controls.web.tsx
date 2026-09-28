import { Pressable, Text, View } from "react-native";
import { VideoControlProps } from "./controls.types";
import { ChevronLeft } from "lucide-react-native";

const VideoControls = ({ children, title, onBack }: VideoControlProps) => {
  return (
    <View className="w-full h-full flex-1 justify-center items-center relative">
      {children}

      <View className="w-full h-full absolute top-0 left-0 right-0 items-center justify-between bg-black/50">
        {/* title & back */}
        <View className="flex-row items-center justify-between w-full h-12 pl-10 border border-blue-500">
          <Pressable onPress={onBack} hitSlop={12} className="w-10 items-start">
            <Text className="text-white text-3xl font-light leading-9">
              <ChevronLeft />
            </Text>
          </Pressable>

          <Text
            className="flex-1 text-white text-base font-semibold text-center"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>

        {/* quick controls */}
        <Pressable className="w-full flex-1 border border-red-600">
          <Text className="text-white text-base font-semibold text-center my-auto">
            Quick control no button
          </Text>
        </Pressable>

        {/* main controls */}
        <View className="w-full h-20 border border-green-500">
          <Text className="text-white text-base font-semibold text-center my-auto">
            Main controls
          </Text>
        </View>
      </View>
    </View>
  );
};

export default VideoControls;
