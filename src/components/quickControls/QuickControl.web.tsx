import { QuickControlProps } from "@/types/player.types";
import { View } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { Pressable, type ViewStyle } from "react-native";

const QuickControl = ({
  hasNext,
  hasPrev,
  hasSubtitle,
  timestamp,
  op,
  onNext,
  onPrev,
  playPause,
  subtitleToggle,
  updateTimestamp,
  volumeChange,
}: QuickControlProps) => {
  const controls: Record<string, () => void> = {
    k: playPause,
    " ": playPause,
    N: onNext,
    P: onPrev,
    c: subtitleToggle,
    ArrowLeft: () => updateTimestamp(2, false),
    ArrowRight: () => updateTimestamp(2, true),
    Home: () => updateTimestamp(0),
  };

  useEffect(() => {
    const globalKeyEvent = (e: KeyboardEvent) => {
      e.preventDefault();

      console.log("Key down:", e.key);
      const method = controls[e.key];
      method?.();
    };

    window.addEventListener("keydown", globalKeyEvent);

    return () => {
      window.removeEventListener("keydown", globalKeyEvent);
    };
  }, []);

  const style = useMemo<ViewStyle>(() => {
    switch (op?.position) {
      case "left":
        return { left: 20 };
      case "right":
        return { right: 20 };
      case "center":
        return { left: "50%", transform: [{ translateX: "-50%" }] };
      default:
        return {};
    }
  }, [op?.position]);

  return (
    <Pressable
      className="w-full flex-1 border relative border-red-600"
      onPress={playPause}
    >
      {op && (
        <View
          style={{
            borderWidth: 2,
            borderColor: "#fff",

            position: "absolute",
            zIndex: 50,
            top: "50%",
            transform: [{ translateY: "-50%" }],
            ...style,
          }}
        >
          {op.content}
        </View>
      )}
    </Pressable>
  );
};

export default QuickControl;
