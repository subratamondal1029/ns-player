import { Video } from "@/types/video.type";

const pickDir = async (): Promise<FileSystemDirectoryHandle> => {
  try {
    const showDirectoryPicker = window.showDirectoryPicker;

    if (!showDirectoryPicker) {
      throw new Error("Directory picker is not supported in this environment", {
        cause: "CUSTOM",
      });
    }

    return await showDirectoryPicker();
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
};

const getVideos = async (dir: FileSystemDirectoryHandle): Promise<Video[]> => {
  try {
    const videos: Video[] = [];

    for await (const entry of dir.values()) {
      if (entry.kind == "directory") continue;

      const file = await entry.getFile();
      videos.push({ name: file.name, size: file.size });
    }

    return videos;
  } catch (error) {
    throw new Error("Failed to retrieve videos", { cause: error });
  }
};

export { getVideos, pickDir };
