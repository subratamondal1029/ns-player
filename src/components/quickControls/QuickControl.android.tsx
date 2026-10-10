import { QuickControlProps } from "@/types/player.types";
import { useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const QuickControl = ({ updateTimestamp, playPause }: QuickControlProps) => {
  const lastTapTime = useRef<{ left: number; right: number }>({
    left: 0,
    right: 0,
  });
  const isSkipping = useRef<{ left: boolean; right: boolean }>({
    left: false,
    right: false,
  });
  const skipTimeout = useRef<{
    left: number | null;
    right: number | null;
  }>({
    left: null,
    right: null,
  });

  const controls = {
    left: () => updateTimestamp(10, false),
    center: playPause,
    right: () => updateTimestamp(10, true),
  };

  const handleZoneTap = (side: "left" | "right") => {
    const now = Date.now();
    const delta = now - lastTapTime.current[side];
    lastTapTime.current[side] = now;

    const isDoubleTap = delta > 0 && delta <= 350;
    const isContinuous = isSkipping.current[side] && delta <= 750;

    if (isDoubleTap || isContinuous) {
      if (skipTimeout.current[side] !== null) {
        clearTimeout(skipTimeout.current[side]);
        skipTimeout.current[side] = null;
      }

      isSkipping.current[side] = true;
      controls[side]();

      skipTimeout.current[side] = setTimeout(() => {
        isSkipping.current[side] = false;
        skipTimeout.current[side] = null;
      }, 750);
    }
  };

  const createSideGesture = (side: "left" | "right") =>
    Gesture.Tap()
      .runOnJS(true)
      .onEnd(() => {
        handleZoneTap(side);
      });

  const centerGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .runOnJS(true)
    .onEnd(() => {
      controls.center();
    });

  const verticalPan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY([-10, 10])
    .failOffsetX([-30, 30])
    .onUpdate((_event) => {
      // TODO: implement volume control
    });

  const rightGesture = Gesture.Exclusive(
    createSideGesture("right"),
    verticalPan,
  );

  // timeout cleanup
  useEffect(() => {
    return () => {
      if (skipTimeout.current.left !== null) {
        clearTimeout(skipTimeout.current.left);
      }
      if (skipTimeout.current.right !== null) {
        clearTimeout(skipTimeout.current.right);
      }
    };
  }, []);

  return (
    <View className="w-full flex-1">
      <GestureHandlerRootView style={{ flex: 1, flexDirection: "row" }}>
        <GestureDetector gesture={createSideGesture("left")}>
          <Pressable className="w-full flex-1" />
        </GestureDetector>
        <GestureDetector gesture={centerGesture}>
          <Pressable className="w-40" />
        </GestureDetector>
        <GestureDetector gesture={rightGesture}>
          <Pressable className="w-full flex-1" />
        </GestureDetector>
      </GestureHandlerRootView>
    </View>
  );
};

export default QuickControl;
