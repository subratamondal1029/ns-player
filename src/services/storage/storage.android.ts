import {
  ASYNC_STORAGE_DIR_KEY,
  ASYNC_STORAGE_TIMESTAMP_BAK_KEY,
  ASYNC_STORAGE_TIMESTAMP_KEY,
} from "@/constants";
import { Timestamp } from "@/types/timestamp.types";
import {
  comparePlaylistName,
  encodePlaylistName,
} from "@/utils/playlistName";
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
    const toSave: Timestamp = {
      ...timestamp,
      playlist: encodePlaylistName(timestamp.playlist),
    };
    await AsyncStorage.setItem(
      ASYNC_STORAGE_TIMESTAMP_KEY,
      JSON.stringify(toSave),
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
      if (timestamp && comparePlaylistName(timestamp.playlist, playlist)) {
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

    if (existingPlaylist && comparePlaylistName(existingPlaylist.playlist, playlist)) {
      return; // already existing playlist no need to overwrite
    }

    await saveTimestampState({
      playlist: encodePlaylistName(playlist),
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

const backupTimestampState = async (timestamp: Timestamp): Promise<void> => {
  if (!timestamp || !timestamp.playlist) return;
  try {
    const toBackup: Timestamp = {
      ...timestamp,
      playlist: encodePlaylistName(timestamp.playlist),
    };
    await AsyncStorage.setItem(
      ASYNC_STORAGE_TIMESTAMP_BAK_KEY,
      JSON.stringify(toBackup),
    );
  } catch (error) {
    console.warn("WARN :: error while backup current timestamp ::", error);
  }
};

const loadBackupTimestampState = async (
  playlist: string,
): Promise<Timestamp | null> => {
  try {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_TIMESTAMP_BAK_KEY);
    if (!raw) return null;
    const bak: Timestamp = JSON.parse(raw);
    if (bak && comparePlaylistName(bak.playlist, playlist)) {
      return bak;
    }
    return null;
  } catch (error) {
    console.error("Failed to read backup timestamp", error);
    return null;
  }
};

const uploadPlaylist = async (playlist: string): Promise<Timestamp> => {
  try {
    const encodedPlaylist = encodePlaylistName(playlist);

    // 1. Check existing current timestamp
    let current: Timestamp | null = null;
    try {
      const rawCurrent = await AsyncStorage.getItem(
        ASYNC_STORAGE_TIMESTAMP_KEY,
      );
      if (rawCurrent) {
        current = JSON.parse(rawCurrent);
      }
    } catch (err) {
      throw new Error("Error reading current timestamp", { cause: err });
    }

    // 2. Check whether playlist already exists in current timestamp
    if (current && comparePlaylistName(current.playlist, playlist)) {
      return current;
    }

    // 3. Check backup store for the playlist
    const bak = await loadBackupTimestampState(playlist);

    // Backup current playlist timestamp before switching/overwriting
    if (current && current.playlist) {
      await backupTimestampState(current);
    }

    if (bak) {
      // Restore from backup; keep original updatedAt intact
      await saveTimestampState(bak);
      return bak;
    }

    // 4. Absent from backup, initialize default timestamp
    const defaultState: Timestamp = {
      playlist: encodedPlaylist,
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
  uploadPlaylist
};

