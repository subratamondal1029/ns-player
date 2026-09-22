import { Video } from "@/types/video.type";

export const sortVideos = (videos: Video[]) => {
  return videos.sort((a, b) => a.name.localeCompare(b.name));
};
