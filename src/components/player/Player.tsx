import { Platform, Text, View } from "react-native";

type VideoPlayerProps = {
  uri: string;
  title: string;
  playlist: string;
  onBack: () => void;
  onPlayPause: () => void;
  onSkip: (timestamp: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeChange: (volume: number) => void;
};

/*
Controls needed:
1. Back
2. Play/Pause
3. Skip
4. Next/Previous
5. Volume

Data needed:
1. Video URI
2. Video title
3. Playlist
*/

export default function VideoPlayer({}: VideoPlayerProps) {
  return (
    <View className="flex-1 w-full h-full bg-black justify-center items-center">
      <Text className="text-white text-base font-semibold text-center">
        Video Player not support on {Platform.OS}
      </Text>
    </View>
  );
}
