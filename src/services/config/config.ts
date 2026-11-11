import { Config } from "@/types/config.types";
import { Platform } from "react-native";

const saveConfig = async (config: Config): Promise<void> => {
  throw new Error(`Config service not implemented on ${Platform.OS}`);
};

const getConfig = async (): Promise<Config | null> => {
  throw new Error(`Config service not implemented on ${Platform.OS}`);
};

export { getConfig, saveConfig };

