import { Platform } from "react-native";
import type { Video } from "@/types/video.type";

export default function folderPicker():Promise<Video[]> {
  throw new Error(`Folder picker not implemented on ${Platform.OS}`);
}