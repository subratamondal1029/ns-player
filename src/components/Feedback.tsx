import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface FeedbackProps {
  children?: React.ReactNode;
}

/**
 * Centered circular animated feedback overlay (e.g. play/pause/seek indicators)
 */
export default function Feedback({ children }: FeedbackProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (children) {
      opacity.setValue(0);
      scale.setValue(0.8);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 120,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [children]);

  if (!children) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 items-center justify-center z-30"
    >
      <Animated.View
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
