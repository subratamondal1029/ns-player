import { QuickControlProps } from "@/types/player.types";
import { Pressable, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

let count = 0;

const QuickControl = ({
  updateTimestamp,
  playPause,
}: QuickControlProps) => {
  const doubleTapControls = {
    left: () => updateTimestamp(10, false),
    center: playPause,
    right: () => updateTimestamp(10, true),
  };

  const createDoubleTap = (side: "left" | "center" | "right") =>
    Gesture.Tap()
      .numberOfTaps(2)
      .maxDuration(250)
      .runOnJS(true)
      .onEnd(() => {
        doubleTapControls[side]();
      });

  const verticalPan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY([-10, 10])
    .failOffsetX([-30, 30])
    .onUpdate((event) => {
      if (event.translationY < 0) {
        console.log("volume update +", Date.now());
      } else {
        console.log("volume update -", Date.now());
      }
    });

  const rightGesture = Gesture.Exclusive(createDoubleTap("right"), verticalPan);

  return (
    <View className="w-full flex-1">
      <GestureHandlerRootView style={{ flex: 1, flexDirection: "row" }}>
        <GestureDetector gesture={createDoubleTap("left")}>
          <Pressable className="w-full flex-1"></Pressable>
        </GestureDetector>
        <GestureDetector gesture={createDoubleTap("center")}>
          <Pressable className="w-40"></Pressable>
        </GestureDetector>
        <GestureDetector gesture={rightGesture}>
          <Pressable className="w-full flex-1"></Pressable>
        </GestureDetector>
      </GestureHandlerRootView>
    </View>
  );
};

export default QuickControl;
