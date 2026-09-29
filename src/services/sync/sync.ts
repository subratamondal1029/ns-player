import { Timestamp } from "@/types/timestamp.types";
import { Platform } from "react-native";

const syncTimestamp = async (
  isSending?: boolean,
  timestamp?: Timestamp,
  url?: string,
): Promise<string | Timestamp> => {
  throw new Error(`Sync timestamp is not implemented on ${Platform.OS}`);
};

export { syncTimestamp };
