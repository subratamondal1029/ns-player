import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0b0b0d",
  },

  container: {
    flex: 1,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    backgroundColor: "#111113",
    paddingHorizontal: 28,
    paddingTop: 26,
    paddingBottom: 18,

    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.35)",
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  video: { width: "100%", height: "100%" },
});

export default styles;
