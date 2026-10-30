import { QuickControlProps } from "@/types/player.types";
import { type ComponentRef, useEffect, useRef } from "react";
import { Pressable } from "react-native";

/**
 * Web-specific implementation of QuickControl.
 * Handles keyboard shortcuts and cursor tracking for controls visibility.
 *
 * @param props - QuickControlProps passed from the parent player.
 * @returns JSX.Element
 */
const QuickControl = ({
  onNext,
  onPrev,
  playPause,
  subtitleToggle,
  updateTimestamp,
  toggleControls,
  closePlayer,
  toggleFullscreen,
}: QuickControlProps) => {
  const pressableRef = useRef<ComponentRef<typeof Pressable> | null>(null);

  const controlsRef = useRef<Record<string, () => void>>({
    k: playPause,
    " ": playPause,
    N: onNext,
    P: onPrev,
    c: subtitleToggle,
    f: toggleFullscreen,
    ArrowLeft: () => updateTimestamp(10, false),
    ArrowRight: () => updateTimestamp(10, true),
    Home: () => updateTimestamp(0),
    Escape: closePlayer,
  });

  useEffect(() => {
    controlsRef.current = {
      k: playPause,
      " ": playPause,
      N: onNext,
      P: onPrev,
      c: subtitleToggle,
      f: toggleFullscreen,
      ArrowLeft: () => updateTimestamp(10, false),
      ArrowRight: () => updateTimestamp(10, true),
      Home: () => updateTimestamp(0),
      Escape: closePlayer,
    };
  }, [
    playPause,
    onNext,
    onPrev,
    subtitleToggle,
    toggleFullscreen,
    updateTimestamp,
    closePlayer,
  ]);

  useEffect(() => {
    const abCtrl = new AbortController();

    // Global keyboard and browser navigation events.
    window.addEventListener(
      "keydown",
      (e: KeyboardEvent) => {
        const action = controlsRef.current[e.key];
        if (action) {
          e.preventDefault();
          action();
        }
      },
      {
        signal: abCtrl.signal,
      },
    );

    window.addEventListener(
      "popstate",
      (e: PopStateEvent) => {
        console.log("back trigger");
      },
      { signal: abCtrl.signal },
    );

    // Pointer tracking for controls visibility.
    const node = pressableRef.current as unknown as HTMLElement | null;
    const container = node?.parentElement?.parentElement ?? node?.parentElement;

    if (container) {
      container.addEventListener(
        "pointermove",
        () => {
          toggleControls(true);
        },
        {
          signal: abCtrl.signal,
        },
      );
      container.addEventListener(
        "pointerleave",
        () => {
          toggleControls(false);
        },
        {
          signal: abCtrl.signal,
        },
      );
    }

    return () => {
      abCtrl.abort();
    };
  }, [toggleControls]);

  return (
    <Pressable
      ref={pressableRef}
      style={{ width: "100%", height: "100%" }}
      className="w-full h-full flex-1 outline-none focus:outline-none"
      onPress={playPause}
    />
  );
};

export default QuickControl;
