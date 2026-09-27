import {
  DB_NAME,
  DIR_STORE_KEY,
  DIR_STORE_NAME,
  SERVER_URL,
} from "@/constants";
import { Timestamp } from "@/types/timestamp.types";
import { openDB } from "idb";
import { Platform } from "react-native";

type FileSystemDirectoryHandleWithPermission = FileSystemDirectoryHandle & {
  queryPermission(options?: {
    mode?: "read" | "readwrite";
  }): Promise<PermissionState>;

  requestPermission(options?: {
    mode?: "read" | "readwrite";
  }): Promise<PermissionState>;
};

const getDB = async () => {
  if (Platform.OS !== "web") {
    throw new Error("Operation not supported on this platform");
  }

  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(DIR_STORE_NAME)) {
        db.createObjectStore(DIR_STORE_NAME);
      }
    },
  });
};

const saveDir = async (
  handler: FileSystemDirectoryHandle,
  playlist: string,
): Promise<void> => {
  try {
    const db = await getDB();
    await db.put(DIR_STORE_NAME, { dir: handler, playlist }, DIR_STORE_KEY);
  } catch (error) {
    throw new Error("Dir save failed", { cause: error });
  }
};

const loadDir = async (): Promise<{
  dir: FileSystemDirectoryHandleWithPermission;
  playlist: string;
} | null> => {
  try {
    const db = await getDB();
    const data = await db.get(DIR_STORE_NAME, DIR_STORE_KEY);

    if (!data) return null;

    const { dir, playlist } = data;

    if (!dir || !playlist) return null;

    const permission = await dir.queryPermission({
      mode: "read",
    });

    if (permission !== "granted") {
      const requested = await dir.requestPermission({
        mode: "read",
      });

      if (requested !== "granted") {
        throw new Error("Permission denied", { cause: "CUSTOM" });
      }
    }

    return { dir, playlist };
  } catch (error) {
    if ((error as Error).cause === "CUSTOM") {
      throw error;
    }

    throw new Error("Dir load failed", { cause: error });
  }
};

const saveTimestampState = async (timestamp: Timestamp): Promise<void> => {
  try {
    const res = await (
      await fetch(`${SERVER_URL}/timestamp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(timestamp),
      })
    ).json();

    if (!res.success) {
      throw new Error(res.message, { cause: "API_ERROR" });
    }
  } catch (error) {
    throw new Error("Timestamp state save failed", { cause: error });
  }
};

const loadTimestampState = async (): Promise<Timestamp | null> => {
  try {
    const res = await (
      await fetch(`${SERVER_URL}/timestamp`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (!res.success) {
      throw new Error(res.message, { cause: "API_ERROR" });
    }

    return res.data;
  } catch (error) {
    throw new Error("Timestamp state load failed", { cause: error });
  }
};

export { loadDir, loadTimestampState, saveDir, saveTimestampState };
