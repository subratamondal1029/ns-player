import { saveTimestampState } from "@/services/storage/storage";
import { Timestamp } from "@/types/timestamp.types";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type TTimestampContext = {
  rawTimestamp: Timestamp | null;
  getTimestamp: (playlist: string, index: number) => number;
  setTimestamp: (playlist: string, index: number, timestamp: number) => void;
  resetTimestamp: (timestamp: Timestamp | null) => void;
  lastPlayedVideoIdx: number;
};

const TimestampContext = createContext<TTimestampContext | null>(null);

const TimestampProvider = ({ children }: { children: React.ReactNode }) => {
  const [timestamp, setTimestamp] = useState<Timestamp | null>(null);
  const readyForStorage = useRef<boolean>(false);

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
    readyForStorage.current = true;
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
          return {
            ...prev,
            current: { ...prev.current, timestamp: tsp },
          };
        }

        return {
          ...prev,
          previous: prev.current,
          current: { index, timestamp: tsp },
        };
      });
    }
  };

  const resetTimestamp = (timestamp: Timestamp | null) => {
    readyForStorage.current = false;
    setTimestamp(timestamp);
  };

  useEffect(() => {
    console.log("Timestamp: ", timestamp);
    if (readyForStorage.current && timestamp) {
      saveTimestampState(timestamp);
    }
  }, [timestamp]);

  return (
    <TimestampContext.Provider
      value={{
        rawTimestamp: timestamp,
        getTimestamp,
        setTimestamp: saveTimestamp,
        resetTimestamp,
        lastPlayedVideoIdx: timestamp ? timestamp.current.index : -1,
      }}
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
