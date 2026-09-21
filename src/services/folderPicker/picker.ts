import type { Video } from "@/types/video.type";
import { Directory } from "expo-file-system";
import { Platform } from "react-native";

type Dir = FileSystemDirectoryHandle | Directory;

const pickDir = async (): Promise<Dir> => {
  throw new Error(`Directory picker not implemented on ${Platform.OS}`);
};

const getVideos = async (dir: Dir): Promise<Video[]> => {
  throw new Error(`Video retrieval not implemented on ${Platform.OS}`);
};

export { getVideos, pickDir };

