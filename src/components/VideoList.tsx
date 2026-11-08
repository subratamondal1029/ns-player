import { Video } from "@/types/video.type";
import { Pressable, ScrollView, Text, View } from "react-native";

type VideoListProps = {
  videos: Video[];
  previousVideoIdx: number;
  continueVideoIdx: number;
  play(index: number): void;
};

export default function VideoList({
  videos,
  previousVideoIdx,
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
        const isPrevious =
          previousVideoIdx === index && continueVideoIdx !== index;
        return (
          <Pressable
            key={`${video.name}-${index}`}
            onPress={() => play(index)}
            className={`w-full flex-row items-center justify-between p-4 rounded-xl border ${
              isCurrent
                ? "bg-neutral-900 border-blue-500/60"
                : isPrevious
                  ? "bg-neutral-900/60 border-blue-400/25"
                  : "bg-neutral-900/60 border-neutral-800/80 active:bg-neutral-800/70"
            }`}
          >
            <View className="flex-row items-center gap-3.5 flex-1 mr-3">
              <View
                className={`w-9 h-9 rounded-lg items-center justify-center ${
                  isCurrent
                    ? "bg-blue-500/20"
                    : isPrevious
                      ? "bg-blue-500/10"
                      : "bg-neutral-800/80"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isCurrent
                      ? "text-blue-400"
                      : isPrevious
                        ? "text-blue-300/70"
                        : "text-neutral-400"
                  }`}
                >
                  {index + 1}
                </Text>
              </View>

              <View className="flex-1">
                <Text
                  numberOfLines={2}
                  className={`text-sm sm:text-base font-medium ${
                    isCurrent
                      ? "text-blue-200"
                      : isPrevious
                        ? "text-blue-100/75"
                        : "text-neutral-200"
                  }`}
                >
                  {video.name}
                </Text>
              </View>
            </View>

            {(isCurrent || isPrevious) && (
              <View
                className={`px-2.5 py-1 rounded-full border ${
                  isCurrent
                    ? "bg-blue-500/20 border-blue-500/30"
                    : "bg-orange-500/10 border-orange-400/20"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isCurrent ? "text-blue-400" : "text-orange-300/80"
                  }`}
                >
                  {isCurrent ? "Continue" : "Last Played"}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
