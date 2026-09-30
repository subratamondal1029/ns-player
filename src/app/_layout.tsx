import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { TimestampProvider } from "@/context/timestampContext";
import { VideoProvider } from "@/context/videoContext";
import "../../global.css";

export default function RootLayout() {
  return (
    <VideoProvider>
      <TimestampProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </TimestampProvider>
    </VideoProvider>
  );
}
