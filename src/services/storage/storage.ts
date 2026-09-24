import { Directory } from "expo-file-system";
import { Platform } from "react-native";

// TODO: store playlist key

type Dir = FileSystemDirectoryHandle | Directory;

const saveDir = async (dir: Dir, playlist: string): Promise<void> => {
  throw new Error(`Directory saving is not supported in ${Platform.OS}`);
};

const loadDir = async (): Promise<{ dir: Dir; playlist: string } | null> => {
  throw new Error(`Directory loading is not supported in ${Platform.OS}`);
};

export { loadDir, saveDir };
