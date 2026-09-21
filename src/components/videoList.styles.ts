import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },

  listContent: {
    gap: 14,
    paddingTop: 2,
    paddingBottom: 12,
  },

  videoItem: {
    height: 84,
    backgroundColor: "#151517",
    borderWidth: 1,
    borderColor: "#353539",
    borderRadius: 17,
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    paddingHorizontal: 22,

    cursor: "pointer",

    boxShadow: "0px 3px 7px rgba(0, 0, 0, 0.2)",
  },

  videoTitle: {
    color: "#e5e5e7",
    fontSize: 18,
    fontWeight: "500",
    paddingRight: 65,
  },

  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "80%",
    height: 3,
    backgroundColor: "#29292d",
  },

  progress: {
    width: "100%",
    height: "100%",
    backgroundColor: "#4da3ff",
  },

  progressCircle: {
    position: "absolute",
    right: 18,
    top: 15,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "#4da3ff",
    alignItems: "center",
    justifyContent: "center",
  },

  progressCircleInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#4da3ff",
  },
});

export default styles;
