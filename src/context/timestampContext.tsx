import {
  loadTimestampState,
  saveTimestampState,
} from "@/services/storage/storage";
import { Timestamp } from "@/types/timestamp.types";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type TTimestampContext = {
  getTimestamp: (playlist: string, index: number) => number;
  setTimestamp: (playlist: string, index: number, timestamp: number) => void;
  lastPlayedVideoIdx: (playlist: string) => number;
};

const TimestampContext = createContext<TTimestampContext | null>(null);

const TimestampProvider = ({ children }: { children: React.ReactNode }) => {
  const [timestamp, setTimestamp] = useState<Timestamp | null>(null);
  const readForStorage = useRef<boolean>(false);

  const getTimestamp = (playlist: string, index: number) => {
    if (!timestamp) return 0;
    if (timestamp.current.index === index) {
      return timestamp.current.timestamp;
    } else if (timestamp.previous.index === index) {
      return timestamp.previous.timestamp;
    } else {
      return 0;
    }
  };

  const saveTimestamp = (playlist: string, index: number, tsp: number) => {
    readForStorage.current = true;
    if (!timestamp || timestamp.playlist !== playlist) {
      // create new
      setTimestamp({
        playlist,
        current: {
          index,
          timestamp: tsp,
        },
        previous: {
          index: Math.max(0, index - 1),
          timestamp: 0,
        },
      });
    } else {
      setTimestamp((prev) => {
        if (!prev) return null;

        if (prev.current.index === index) {
          prev.current.timestamp = tsp;
        } else {
          prev.previous = prev.current;
          prev.current.index = index;
          prev.current.timestamp = tsp;
        }

        return prev;
      });
    }
  };

  const lastPlayedVideoIdx = (playlist: string) => {
    if (!timestamp || timestamp.playlist !== playlist) return -1;
    return timestamp.current.index;
  };

  useEffect(() => {
    const loadTimestamp = async () => {
      try {
        const data = await loadTimestampState(); //TODO: call this after playlist load
        if (data) {
          setTimestamp(data);
        }
      } catch (error) {
        console.error("Error loading timestamp:", error);
      }
    };

    loadTimestamp();
  }, []);

  useEffect(() => {
    // update in storage
    if (readForStorage.current && timestamp) {
      saveTimestampState(timestamp);
    }
  }, [timestamp]);

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
