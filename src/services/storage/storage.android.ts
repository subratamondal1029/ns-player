import {
  ASYNC_STORAGE_DIR_KEY,
  ASYNC_STORAGE_TIMESTAMP_BAK_KEY,
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
      updatedAt: 0,
    });
  } catch (error) {
    console.error("Timestamp state reset failed", error);
    throw new Error("Timestamp state reset failed", { cause: error });
  }
};

const getBackupStore = async (): Promise<Record<string, Timestamp>> => {
  try {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_TIMESTAMP_BAK_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to read backup timestamps", error);
    return {};
  }
};

const saveBackupStore = async (
  backups: Record<string, Timestamp>,
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      ASYNC_STORAGE_TIMESTAMP_BAK_KEY,
      JSON.stringify(backups),
    );
  } catch (error) {
    throw new Error("Failed to save backup timestamps", { cause: error });
  }
};

const backupTimestampState = async (timestamp: Timestamp): Promise<void> => {
  if (!timestamp || !timestamp.playlist) return;
  const backups = await getBackupStore();
  backups[timestamp.playlist] = timestamp;
  await saveBackupStore(backups);
};

const loadBackupTimestampState = async (
  playlist: string,
): Promise<Timestamp | null> => {
  const backups = await getBackupStore();
  return backups[playlist] ?? null;
};

const uploadPlaylist = async (playlist: string): Promise<Timestamp> => {
  try {
    // 1. Check current timestamp and back it up before switching/overwriting
    const rawCurrent = await AsyncStorage.getItem(ASYNC_STORAGE_TIMESTAMP_KEY);
    let current: Timestamp | null = null;
    if (rawCurrent) {
      try {
        current = JSON.parse(rawCurrent);
        if (current && current.playlist) {
          await backupTimestampState(current);
        }
      } catch (err) {
        console.error("Failed to parse current timestamp for backup", err);
      }
    }

    // 2. If playlist already matches current timestamp, keep it
    if (current && current.playlist === playlist) {
      return current;
    }

    // 3. Check backup store for this playlist
    const bak = await loadBackupTimestampState(playlist);
    if (bak) {
      // Restore from backup keeping original updatedAt intact
      await saveTimestampState(bak);
      return bak;
    }

    // 4. Absent from backup, initialize default
    const defaultState: Timestamp = {
      playlist,
      current: {
        index: 0,
        timestamp: 0.0,
      },
      previous: {
        index: 0,
        timestamp: 0.0,
      },
      updatedAt: 0,
    };
    await saveTimestampState(defaultState);
    return defaultState;
  } catch (error) {
    console.error("Playlist upload failed", error);
    throw new Error("Playlist upload failed", { cause: error });
  }
};

export {
  checkDirExist,
  loadDir,
  loadTimestampState,
  resetTimestamp,
  saveDir,
  saveTimestampState,
  uploadPlaylist,
};

