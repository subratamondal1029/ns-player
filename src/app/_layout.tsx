import { Stack } from "expo-router";

import { TimestampProvider } from "@/context/timestampContext";
import { VideoProvider } from "@/context/videoContext";
import "../../global.css";

export default function RootLayout() {
  return (
    <VideoProvider>
      <TimestampProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </TimestampProvider>
    </VideoProvider>
  );
}
