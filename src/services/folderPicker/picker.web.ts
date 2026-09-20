import { Video } from "@/types/video.type";
import { loadDir, saveDir } from "../storage/storage.web";
// TODO: save playlist key

const pickFolder = async (): Promise<FileSystemDirectoryHandle> => {
  const showDirectoryPicker = window.showDirectoryPicker;

  if (!showDirectoryPicker) {
    throw new Error("Directory picker is not supported in this environment", {
      cause: "CUSTOM",
    });
  }

  const handler = await showDirectoryPicker();
  await saveDir(handler);
  return handler;
};

export default async function folderPicker(
  freshPick: boolean,
): Promise<Video[]> {
  try {
    let dirHandler: FileSystemDirectoryHandle;

    if (freshPick) {
      dirHandler = await pickFolder();
    } else {
      dirHandler = await loadDir();
      if (!dirHandler) {
        dirHandler = await pickFolder();
      }
    }

    const videos: Video[] = [];

    for await (const entry of dirHandler.values()) {
      if (entry.kind == "directory") continue;

      const file = await entry.getFile();
      videos.push({ name: file.name, size: file.size });
    }

    return videos;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Directory selection cancelled", { cause: error });
    }

    if ((error as Error).cause === "CUSTOM") {
      throw error;
    } else {
      throw new Error("Failed to read directory", { cause: error });
    }
  }
}
