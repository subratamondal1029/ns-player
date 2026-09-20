import { Video } from "@/types/video.type";

export default async function folderPicker(): Promise<Video[]> {
  try {
    const showDirectoryPicker = window.showDirectoryPicker;

    if (!showDirectoryPicker) {
      throw new Error("Directory picker is not supported in this environment", {
        cause: "CUSTOM",
      });
    }

    const dirHandler = await showDirectoryPicker();
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
