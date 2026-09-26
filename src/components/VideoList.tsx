import { Video } from "@/types/video.type";
import { Pressable, ScrollView, Text, View } from "react-native";

type VideoListProps = {
  videos: Video[];
  continueVideoIdx: number;
  play(index: number): void;
};

export default function VideoList({
  videos,
  continueVideoIdx,
  play,
}: VideoListProps) {
  return (
    <ScrollView
      className="flex-1 w-full"
      contentContainerClassName="gap-3 pb-8"
      showsVerticalScrollIndicator={false}
    >
      {videos.map((video, index) => {
        const isCurrent = continueVideoIdx === index;
        return (
          <Pressable
            key={`${video.name}-${index}`}
            onPress={() => play(index)}
            className={`w-full flex-row items-center justify-between p-4 rounded-xl border ${
              isCurrent
                ? "bg-neutral-900 border-blue-500/60"
                : "bg-neutral-900/60 border-neutral-800/80 active:bg-neutral-800/70"
            }`}
          >
            <View className="flex-row items-center gap-3.5 flex-1 mr-3">
              <View
                className={`w-9 h-9 rounded-lg items-center justify-center ${
                  isCurrent ? "bg-blue-500/20" : "bg-neutral-800/80"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isCurrent ? "text-blue-400" : "text-neutral-400"
                  }`}
                >
                  {index + 1}
                </Text>
              </View>

              <View className="flex-1">
                <Text
                  numberOfLines={2}
                  className={`text-sm sm:text-base font-medium ${
                    isCurrent ? "text-blue-200" : "text-neutral-200"
                  }`}
                >
                  {video.name}
                </Text>
              </View>
            </View>

            {isCurrent && (
              <View className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                <Text className="text-xs font-semibold text-blue-400">
                  Continue
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
