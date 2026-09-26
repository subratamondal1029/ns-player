import {
  ASYNC_STORAGE_DIR_KEY,
  ASYNC_STORAGE_TIMESTAMP_KEY
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
const loadTimestampState = async (): Promise<Timestamp | null> => {
  try {
    const timestampJson = await AsyncStorage.getItem(ASYNC_STORAGE_TIMESTAMP_KEY);

    if (timestampJson) {
      return JSON.parse(timestampJson);
    } else return null;
  } catch (error) {
    throw new Error("Timestamp state load failed", { cause: error });
  }
};

export { loadDir, loadTimestampState, saveDir, saveTimestampState };
