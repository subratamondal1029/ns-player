import { Pressable, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import VideoList from "@/components/VideoList";

import styles  from "./index.styles";

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Playlist Title here</Text>

          <View style={styles.topButtons}>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>select</Text>
            </Pressable>

            <Pressable style={[styles.button, styles.syncButton]}>
              <Text style={styles.buttonText}>sync</Text>
            </Pressable>
          </View>

          <View style={styles.actionButtons}>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionText}>continue</Text>
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Text style={styles.actionText}>start over</Text>
            </Pressable>
          </View>

          <VideoList />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
