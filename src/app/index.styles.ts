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
    borderWidth: 1,
    borderColor: "#343438",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingTop: 26,
    paddingBottom: 18,

    boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.35)",
  },

  title: {
    color: "#f2f2f3",
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 34,
    letterSpacing: 0.3,
  },

  topButtons: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },

  button: {
    flex: 1,
    height: 54,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#3a3a3f",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  syncButton: {
    flex: 0.6,
  },

  buttonText: {
    color: "#dedee1",
    fontSize: 19,
    fontWeight: "500",
  },

  actionButtons: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 22,
  },

  actionButton: {
    flex: 1,
    height: 52,
    backgroundColor: "#e9e9eb",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  actionText: {
    color: "#111113",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default styles;
