import { Timestamp } from "@/types/timestamp.types";
import { Platform } from "react-native";

const syncTimestamp = async (
  timestamp?: Timestamp,
): Promise<string | Timestamp | null> => {
  throw new Error(`Sync timestamp is not implemented on ${Platform.OS}`);
};

export { syncTimestamp };
