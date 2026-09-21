import { Directory } from "expo-file-system";

export interface Video {
  name: string;
  size: number;
}
export type Dir = FileSystemDirectoryHandle | Directory;
