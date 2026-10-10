import { QuickControlProps } from "@/types/player.types";
import { useEffect, useRef } from "react";
import { Pressable } from "react-native";

const QuickControl = ({
  onNext,
  onPrev,
  playPause,
  subtitleToggle,
  updateTimestamp,
}: QuickControlProps) => {
  const controlsRef = useRef<Record<string, () => void>>({
    k: playPause,
    " ": playPause,
    N: onNext,
    P: onPrev,
    c: subtitleToggle,
    ArrowLeft: () => updateTimestamp(10, false),
    ArrowRight: () => updateTimestamp(10, true),
    Home: () => updateTimestamp(0),
  });

  useEffect(() => {
    const globalKeyEvent = (e: KeyboardEvent) => {
      const action = controlsRef.current[e.key];
      if (action) {
        e.preventDefault();
        action();
      }
    };

    window.addEventListener("keydown", globalKeyEvent);

    return () => {
      window.removeEventListener("keydown", globalKeyEvent);
    };
  }, []);

  return (
    <Pressable
      className="w-full flex-1 outline-none focus:outline-none"
      onPress={playPause}
    ></Pressable>
  );
};

export default QuickControl;
