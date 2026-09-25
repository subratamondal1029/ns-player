import { Video } from "@/types/video.type";
import { createContext, useContext, useState } from "react";

type TVideoContext = {
  videos: Video[];
  setVideos: (videos: Video[], index?: number) => void;
  currentVideoIdx: number;
  hasNext: () => boolean;
  hasPrev: () => boolean;
  next: () => void;
  prev: () => void;
};

const VideoContext = createContext<TVideoContext | null>(null);

const VideoProvider = ({ children }: { children: React.ReactNode }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIdx, setCurrentVideoIdx] = useState<number>(0);

  const storeVideos = (videos: Video[], index: number = 0) => {
    setVideos(videos);
    setCurrentVideoIdx(index);
  };

  const hasNext = () => {
    return currentVideoIdx < videos.length - 1;
  };

  const hasPrev = () => {
    return currentVideoIdx > 0;
  };

  const next = () => {
    if (currentVideoIdx < videos.length - 1) {
      setCurrentVideoIdx(currentVideoIdx + 1);
    }
  };

  const prev = () => {
    if (currentVideoIdx > 0) {
      setCurrentVideoIdx(currentVideoIdx - 1);
    }
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        setVideos: storeVideos,
        currentVideoIdx,
        hasNext,
        hasPrev,
        next,
        prev,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

const useVideo = () => {
  const context = useContext(VideoContext);

  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }

  return context;
};

export { useVideo, VideoProvider };

