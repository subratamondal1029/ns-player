import type { Dir, Video } from "@/types/video.type";
import { Platform } from "react-native";



const findVideos = async (dir: Dir): Promise<Video[]> => {
  throw new Error(`Finding videos is not implemented on ${Platform.OS}`);
};

const getVideoUri = async (dir: Dir, videoName: string): Promise<string | null> => {
  throw new Error(`Getting video URI is not implemented on ${Platform.OS}`);
};

export { findVideos, getVideoUri };