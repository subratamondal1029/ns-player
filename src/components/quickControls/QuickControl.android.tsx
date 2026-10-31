import { QuickControlProps } from "@/types/player.types";
import { useEffect, useRef } from "react";
import { Pressable, View } from "react-native";
import {
  GestureDetector,
  GestureHandlerRootView,
  useTapGesture,
} from "react-native-gesture-handler";

const QuickControl = ({
  updateTimestamp,
  playPause,
  toggleControls,
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

  const handleSingleTap = () => {
    clearSingleTapTimer();
    singleTapTimeout.current = setTimeout(() => {
      toggleControls();
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
      handleSingleTap();
    }
  };

  const handleCenterTap = () => {
    const delta = getDelta("center");

    if (delta > 0 && delta <= 350) {
      clearSingleTapTimer();
      controls.center();
    } else {
      handleSingleTap();
    }
  };

  const leftTapGesture = useTapGesture({
    runOnJS: true,
    onDeactivate: () => {
      handleZoneTap("left");
    },
  });

  const centerTapGesture = useTapGesture({
    runOnJS: true,
    onDeactivate: () => {
      handleCenterTap();
    },
  });

  const rightTapGesture = useTapGesture({
    runOnJS: true,
    onDeactivate: () => {
      handleZoneTap("right");
    },
  });

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
        <GestureDetector gesture={leftTapGesture}>
          <Pressable className="w-full flex-1" />
        </GestureDetector>
        <GestureDetector gesture={centerTapGesture}>
          <Pressable className="w-40" />
        </GestureDetector>
        <GestureDetector gesture={rightTapGesture}>
          <Pressable className="w-full flex-1" />
        </GestureDetector>
      </GestureHandlerRootView>
    </View>
  );
};

export default QuickControl;
