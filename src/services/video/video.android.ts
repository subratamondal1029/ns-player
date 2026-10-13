import type { Video } from "@/types/video.type";
import { Directory, File } from "expo-file-system";

const findFile = (dir: Directory, fileName: string): File | null => {
  try {
    const files = dir.list();
    return files.find((f) => f instanceof File && f.name === fileName) as File | undefined || null;
  } catch (error) {
    console.error("Error occurred while finding file:", error);
    return null
  }
}

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

    const file = findFile(dir, videoName);

    if (!file) return null;

    return file.uri;
  } catch (error) {
    throw new Error("Failed to retrieve video URI", { cause: error });
  }
};

const getVideoRawSubtitle = async (
  dir: Directory,
  videoName: string,
  language: string = "en",
): Promise<string | null> => {
  try {
    const movieBaseName = videoName.substring(0, videoName.lastIndexOf("."));
    const srtFileName = `${movieBaseName}.${language || "en"}.srt`;
    const file = findFile(dir, srtFileName);
    if (!file) return null;
    
    const content = await file.text();
    if (!content.trim()) return null;

    return content;
  } catch (error) {
    console.error("Error occurred while retrieving video raw subtitle:", error);
    throw new Error("Failed to retrieve video raw subtitle", { cause: error });
  }
};

export { findVideos, getVideoRawSubtitle, getVideoUri };
