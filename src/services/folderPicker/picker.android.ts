import { Directory, File } from "expo-file-system";

const pickDir = async (): Promise<Directory> => {
  try {
    const dir = await Directory.pickDirectoryAsync();

    if (!dir) {
      throw new Error("No directory selected", { cause: "CUSTOM" });
    }

    return dir;
  } catch (error) {
    if ((error as Error).cause === "CUSTOM") {
      throw error;
    } else {
      throw new Error("Failed to read directory", { cause: error });
    }
  }
};

const getVideos = async (dir: Directory): Promise<File[]> => {
  try {
    const entities = dir.list();

    const videos = entities
      .filter((entity) => entity instanceof File)
      .filter((file) => file.type?.startsWith("video/") && file.exists);

    return videos;
  } catch (error) {
    throw new Error("Failed to retrieve videos", { cause: error });
  }
};

export { getVideos, pickDir };
