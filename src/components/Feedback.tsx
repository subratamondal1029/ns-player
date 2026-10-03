import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface FeedbackProps {
  children?: React.ReactNode;
}

/**
 * Centered animated feedback overlay (e.g. play/pause/seek indicators)
 */
export default function Feedback({ children }: FeedbackProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    if (!children) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.85,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();

      return;
    }

    opacity.setValue(0);
    scale.setValue(0.85);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [children, opacity, scale]);

  if (!children) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 items-center justify-center z-30"
    >
      <Animated.View
        className="bg-black/60 rounded-full px-5 py-4 items-center justify-center flex-row gap-2"
        style={[
          styles.bubble,
          {
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.35)",
    elevation: 5,
  },
});
