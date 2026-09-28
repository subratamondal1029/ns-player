import { ChevronLeft, Circle } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { VideoControlProps } from "./controls.types";

const VideoControls = ({
  children,
  title,
  onBack,
  player,
  progress = 0,
}: VideoControlProps) => {
  return (
    <View className="w-full h-full flex-1 justify-center items-center relative">
      {children}

      <View className="w-full h-full absolute top-0 left-0 right-0 items-center justify-between bg-black/50">
        {/* title & back */}
        <View className="flex-row items-center justify-between w-full h-12 pl-10 border border-blue-500">
          <Pressable onPress={onBack} hitSlop={12} className="w-10 items-start">
            <ChevronLeft color="#fff" size={28} />
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
        <View className="w-full h-20 border border-green-500 justify-center">
          {/* progress bar */}
          <View className="w-full relative items-center justify-center py-2">
            <Pressable
              id="bar"
              // onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
              className="w-11/12 h-1.5 bg-neutral-700 rounded-full relative justify-center"
            >
              {/* filled progress */}
              <View
                id="progress"
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${progress}%` }}
              />

              {/* scrubber thumb */}
              <View
                className="absolute -top-[5px] -ml-2 pointer-events-none"
                style={{ left: `${progress}%` }}
              >
                <Circle color="#fff" fill="#3b82f6" size={16} />
              </View>
            </Pressable>
          </View>

          <View>{/* controls */}</View>
        </View>
      </View>
    </View>
  );
};

export default VideoControls;
