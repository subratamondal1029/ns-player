import { APP_CONFIG_STORE_KEY } from "@/constants";
import { Config } from "@/types/config.types";

const saveConfig = async (config: Config): Promise<void> => {
  try {
    localStorage.setItem(APP_CONFIG_STORE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error occurred while saving config:", error);
    throw new Error("Failed to save config", { cause: error });
  }
};

const getConfig = async (): Promise<Config | null> => {
  try {
    const raw = localStorage.getItem(APP_CONFIG_STORE_KEY);

    if (!raw) {
      return null;
    }

    const config = JSON.parse(raw) as Config;

    return config;
  } catch (error) {
    console.error("Error occurred while retrieving config:", error);
    throw new Error("Failed to retrieve config", { cause: error });
  }
};

export { getConfig, saveConfig };

