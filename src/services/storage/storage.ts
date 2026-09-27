import { Timestamp } from "@/types/timestamp.types";
import { Directory } from "expo-file-system";
import { Platform } from "react-native";

type Dir = FileSystemDirectoryHandle | Directory;

const saveDir = async (dir: Dir, playlist: string): Promise<void> => {
  throw new Error(`Directory saving is not supported in ${Platform.OS}`);
};

const loadDir = async (): Promise<{ dir: Dir; playlist: string } | null> => {
  throw new Error(`Directory loading is not supported in ${Platform.OS}`);
};

const saveTimestampState = async (timestamp: Timestamp): Promise<void> => {
  throw new Error(`Timestamp state saving is not supported in ${Platform.OS}`);
};

const loadTimestampState = async (): Promise<Timestamp | null> => {
  throw new Error(`Timestamp state loading is not supported in ${Platform.OS}`);
};

export { loadDir, saveDir, saveTimestampState, loadTimestampState };
