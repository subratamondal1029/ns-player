import type { Video } from "@/types/video.type";
import { Platform } from "react-native";

export default async function folderPicker(
  freshPick: boolean,
): Promise<Video[]> {
  throw new Error(`Folder picker not implemented on ${Platform.OS}`);
}
