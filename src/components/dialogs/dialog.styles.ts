import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  dialog: {
    width: 320,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
})

export default styles