import { DB_NAME, DIR_STORE_KEY, DIR_STORE_NAME } from "@/constants";
import { openDB } from "idb";
import { Platform } from "react-native";

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

const saveDir = async (handler: FileSystemDirectoryHandle): Promise<void> => {
  try {
    const db = await getDB();
    await db.put(DIR_STORE_NAME, handler, DIR_STORE_KEY);
  } catch (error) {
    throw new Error("Dir save failed", { cause: error });
  }
};

const loadDir = async (): Promise<FileSystemDirectoryHandle> => {
  try {
    const db = await getDB();
    const result = await db.get(DIR_STORE_NAME, DIR_STORE_KEY);
    return result;
  } catch (error) {
    throw new Error("Dir load failed", { cause: error });
  }
};

export { loadDir, saveDir };
