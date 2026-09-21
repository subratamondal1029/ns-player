import { Directory } from "expo-file-system";
import { Platform } from "react-native";

// TODO: store playlist key

type Dir = FileSystemDirectoryHandle | Directory;

const saveDir = async (dir: Dir): Promise<void> => {
  throw new Error(`Directory saving is not supported in ${Platform.OS}`);
};

const loadDir = async (): Promise<Dir | null> => {
  throw new Error(`Directory loading is not supported in ${Platform.OS}`);
};

export { loadDir, saveDir };
