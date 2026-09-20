import { Video } from "@/types/video.type";
import { Directory, File } from "expo-file-system";
import { loadDir, saveDir } from "../storage/storage.android";
// TODO: save playlist key

const pickFolder = async (): Promise<Directory> => {
  const dir = await Directory.pickDirectoryAsync();
  await saveDir(dir.uri);
  return dir;
};

export default async function folderPicker(
  freshPick: boolean,
): Promise<Video[]> {
  try {
    let directory: Directory;
    if (freshPick) {
      directory = await pickFolder();
    } else {
      const dir = await loadDir();
      if (dir) {
        directory = new Directory(dir.uri);
      } else {
        directory = await pickFolder();
      }
    }

    if (directory) {
      const entities = directory.list();

      const videos = entities
        .filter((entity) => entity instanceof File)
        .filter((file) => file.type?.startsWith("video/") && file.exists);

      return videos;
    } else throw new Error("No directory selected");
  } catch (error) {
    throw new Error("Failed to pick folder on Android", { cause: error });
  }
}
