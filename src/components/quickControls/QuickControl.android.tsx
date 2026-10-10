import { QuickControlProps } from "@/types/player.types";
import { useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const QuickControl = ({
  updateTimestamp,
  playPause,
  hideControls,
}: QuickControlProps) => {
  const lastTapTime = useRef<{ left: number; right: number; center: number }>({
    left: 0,
    right: 0,
    center: 0,
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
  const singleTapTimeout = useRef<number | null>(null);

  const controls = {
    left: () => updateTimestamp(10, false),
    center: playPause,
    right: () => updateTimestamp(10, true),
  };

  const getDelta = (side: "left" | "right" | "center") => {
    const now = Date.now();
    const delta = now - lastTapTime.current[side];
    lastTapTime.current[side] = now;
    return delta;
  };

  const clearSingleTapTimer = () => {
    if (singleTapTimeout.current !== null) {
      clearTimeout(singleTapTimeout.current);
      singleTapTimeout.current = null;
    }
  };

  const handleHideControl = () => {
    clearSingleTapTimer();
    singleTapTimeout.current = setTimeout(() => {
      hideControls();
      singleTapTimeout.current = null;
    }, 350);
  };

  const handleZoneTap = (side: "left" | "right") => {
    const delta = getDelta(side);

    const isDoubleTap = delta > 0 && delta <= 350;
    const isContinuous = isSkipping.current[side] && delta <= 750;

    if (isDoubleTap || isContinuous) {
      clearSingleTapTimer();

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
    } else {
      handleHideControl();
    }
  };

  const handleCenterTap = () => {
    const delta = getDelta("center");

    if (delta > 0 && delta <= 350) {
      clearSingleTapTimer();
      controls.center();
    } else {
      handleHideControl();
    }
  };

  const createSingleTapGesture = (side: "left" | "right" | "center") =>
    Gesture.Tap()
      .runOnJS(true)
      .onEnd(() => {
        if (side === "center") {
          handleCenterTap();
        } else {
          handleZoneTap(side);
        }
      });

  const verticalPan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY([-10, 10])
    .failOffsetX([-30, 30])
    .onUpdate((_event) => {
      // TODO: implement volume control
    });

  const rightGesture = Gesture.Exclusive(
    createSingleTapGesture("right"),
    verticalPan,
  );

  // timeout cleanup
  useEffect(() => {
    return () => {
      clearSingleTapTimer();
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
        <GestureDetector gesture={createSingleTapGesture("left")}>
          <Pressable className="w-full flex-1" />
        </GestureDetector>
        <GestureDetector gesture={createSingleTapGesture("center")}>
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
