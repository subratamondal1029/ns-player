import type { Video } from "@/types/video.type";

const findVideos = async (dir: FileSystemDirectoryHandle): Promise<Video[]> => {
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

const getVideoUri = async (
  dir: FileSystemDirectoryHandle,
  videoName: string,
): Promise<string | null> => {
  try {
    const fileHandler = await dir.getFileHandle(videoName);
    const file = await fileHandler.getFile();
    if (!file) return null;
    return URL.createObjectURL(file);
  } catch (error) {
    throw new Error("Failed to retrieve video URI", { cause: error });
  }
};

export { findVideos, getVideoUri };
