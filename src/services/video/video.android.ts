import type { Video } from "@/types/video.type";
import { Directory, File } from "expo-file-system";

const findVideos = async (dir: Directory): Promise<Video[]> => {
  try {
    const entities = dir.list();

    const videos = entities
      .filter((entity) => entity instanceof File)
      .filter((file) => file.type?.startsWith("video/") && file.exists)
      .map((file) => ({ name: file.name, size: file.size }));

    return videos;
  } catch (error) {
    throw new Error("Failed to retrieve videos", { cause: error });
  }
};

const getVideoUri = async (
  dir: Directory,
  videoName: string,
): Promise<string | null> => {
  try {
    const files = dir.list();

    const file = files.find(
      (f) => f instanceof File && f.name === videoName,
    ) as File | undefined;

    if (!file) return null;

    return file.uri;
  } catch (error) {
    throw new Error("Failed to retrieve video URI", { cause: error });
  }
};

export { findVideos, getVideoUri };
