import {
  ASYNC_STORAGE_DIR_KEY,
  ASYNC_STORAGE_TIMESTAMP_KEY,
} from "@/constants";
import { Timestamp } from "@/types/timestamp.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory } from "expo-file-system";

const saveDir = async (dir: Directory, playlist: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      ASYNC_STORAGE_DIR_KEY,
      JSON.stringify({ uri: dir.uri, playlist }),
    );
  } catch (error) {
    throw new Error("Dir save failed", { cause: error });
  }
};

const loadDir = async (): Promise<{
  dir: Directory;
  playlist: string;
} | null> => {
  try {
    const dirJson = await AsyncStorage.getItem(ASYNC_STORAGE_DIR_KEY);

    if (dirJson) {
      const dirData = JSON.parse(dirJson);
      return { dir: new Directory(dirData.uri), playlist: dirData.playlist };
    } else return null;
  } catch (error) {
    throw new Error("Dir load failed", { cause: error });
  }
};

const checkDirExist = async (): Promise<boolean> => {
  try {
    const dir = await loadDir();
    return dir !== null;
  } catch (error) {
    throw new Error("Failed to check playlist existence", { cause: error });
  }
};

const saveTimestampState = async (timestamp: Timestamp): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      ASYNC_STORAGE_TIMESTAMP_KEY,
      JSON.stringify(timestamp),
    );
  } catch (error) {
    throw new Error("Timestamp state save failed", { cause: error });
  }
};
const loadTimestampState = async (
  playlist: string,
): Promise<Timestamp | null> => {
  try {
    const timestampJson = await AsyncStorage.getItem(
      ASYNC_STORAGE_TIMESTAMP_KEY,
    );

    if (timestampJson) {
      const timestamp = JSON.parse(timestampJson);
      if (timestamp.playlist === playlist) {
        return timestamp;
      } else return null;
    } else return null;
  } catch (error) {
    throw new Error("Timestamp state load failed", { cause: error });
  }
};

const resetTimestamp = async (playlist: string): Promise<void> => {
  try {
    const existingPlaylist = await loadTimestampState(playlist);

    if (existingPlaylist && existingPlaylist.playlist === playlist) {
      return; // already existing playlist no need to overwrite
    }

    await saveTimestampState({
      playlist,
      current: {
        index: 0,
        timestamp: 0.0,
      },
      previous: {
        index: 0,
        timestamp: 0.0,
      },
    });
  } catch (error) {
    console.error("Timestamp state reset failed", error);
    throw new Error("Timestamp state reset failed", { cause: error });
  }
};

export {
  checkDirExist,
  loadDir,
  loadTimestampState,
  resetTimestamp,
  saveDir,
  saveTimestampState
};

