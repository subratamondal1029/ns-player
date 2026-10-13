import type { Video } from "@/types/video.type";

const findFile = async (
  dir: FileSystemDirectoryHandle,
  fileName: string,
): Promise<File | null> => {
  try {
    for await (const [name, handle] of dir.entries()) {
      if (name === fileName && handle.kind === "file") {
        return await handle.getFile();
      }
    }

    return null;
  } catch (error) {
    console.error("Error occurred while finding file:", error);
    return null;
  }
};

const findVideos = async (dir: FileSystemDirectoryHandle): Promise<Video[]> => {
  try {
    const videos: Video[] = [];

    for await (const entry of dir.values()) {
      if (entry.kind === "directory") continue;

      const file = await entry.getFile();
      if (file.type.startsWith("video/")) {
        videos.push({ name: file.name, size: file.size });
      }
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
    const file = await findFile(dir, videoName);
    if (!file) return null;
    return URL.createObjectURL(file);
  } catch (error) {
    throw new Error("Failed to retrieve video URI", { cause: error });
  }
};

const getVideoRawSubtitle = async (
  dir: FileSystemDirectoryHandle,
  videoName: string,
  language?: string,
): Promise<string | null> => {
  try {
    const movieBaseName = videoName.substring(0, videoName.lastIndexOf("."));
    const srtFileName = `${movieBaseName}.${language || "en"}.srt`;

    let file: File | null = await findFile(dir, srtFileName);

    if (!file) return null;

    return await file.text();
  } catch (error) {
    console.error("Error occurred while retrieving video raw subtitle:", error);
    throw new Error("Failed to retrieve video raw subtitle", { cause: error });
  }
};

export { findVideos, getVideoRawSubtitle, getVideoUri };
