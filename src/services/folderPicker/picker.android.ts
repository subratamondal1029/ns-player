import { Video } from "@/types/video.type";
import { Directory, File } from "expo-file-system";

export default async function folderPicker(): Promise<Video[]> {

  
  console.log("Folder picker initialized");
  try {
    
    const directory = await Directory.pickDirectoryAsync();

    if (directory) {
      const entities = directory.list();

      const videos = entities
        .filter((entity) => entity instanceof File)
        .filter((file) => file.type?.startsWith("video/") && file.exists);

      console.log("video picked");
      return videos;
    } else throw new Error("No directory selected");
  } catch (error) {
    throw new Error("Failed to pick folder on Android", { cause: error });
  }
}
