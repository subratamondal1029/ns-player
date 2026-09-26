import { Timestamp } from "@/types/timestamp.types";
import { createContext, useContext, useState } from "react";

type TTimestampContext = {
  getTimestamp: (playlist: string, index: number) => number;
  setTimestamp: (playlist: string, index: number, timestamp: number) => void;
  lastPlayedVideoIdx: (playlist: string) => number;
};

const TimestampContext = createContext<TTimestampContext | null>(null);

const TimestampProvider = ({ children }: { children: React.ReactNode }) => {
  const [timestamp, setTimestamp] = useState<Timestamp | null>(null);

  const getTimestamp = (playlist: string, index: number) => {
    if (!timestamp) return 0;
    const video = timestamp.videos.find((v) => v.index === index);
    return video ? video.timestamp : 0;
  };

  const saveTimestamp = (playlist: string, index: number, tsp: number) => {
    if (!timestamp || timestamp.playlist !== playlist) {
      // create new
      setTimestamp({
        playlist,
        videos: [
          {
            index,
            timestamp: tsp,
          },
        ],
      });
    } else {
      setTimestamp((prev) => {
        if (!prev) return null;
        const videoIdx = prev.videos.findIndex((v) => v.index === index);

        if (videoIdx !== -1) {
          prev.videos[videoIdx].timestamp = tsp;
        } else {
          // max capacity 2
          if (prev.videos.length > 1) {
            // remove oldest
            prev.videos.shift();
          }

          prev.videos.push({
            index,
            timestamp: tsp,
          });
        }

        return prev;
      });
    }
  };

  const lastPlayedVideoIdx = (playlist: string) => {
    if (!timestamp || timestamp.playlist !== playlist) return -1;
    if (timestamp.videos.length === 0) return 0;
    return timestamp.videos[timestamp.videos.length - 1].index;
  };

  return (
    <TimestampContext.Provider
      value={{ getTimestamp, setTimestamp: saveTimestamp, lastPlayedVideoIdx }}
    >
      {children}
    </TimestampContext.Provider>
  );
};

const useTimestamp = () => {
  const context = useContext(TimestampContext);
  if (!context) {
    throw new Error("useTimestamp must be used within a TimestampProvider");
  }
  return context;
};

export { TimestampProvider, useTimestamp };
