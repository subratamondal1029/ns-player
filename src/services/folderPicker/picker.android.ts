import { Directory } from "expo-file-system";

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

export { pickDir };
