import type { Dir } from "@/types/video.type";
import { Platform } from "react-native";

const pickDir = async (): Promise<Dir> => {
  throw new Error(`Directory picker not implemented on ${Platform.OS}`);
};

export { pickDir };
