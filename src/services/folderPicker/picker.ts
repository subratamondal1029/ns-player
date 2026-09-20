import type { Video } from "@/types/video.type";
import { Platform } from "react-native";

export default async function folderPicker(): Promise<Video[]> {
  throw new Error(`Folder picker not implemented on ${Platform.OS}`);
}
