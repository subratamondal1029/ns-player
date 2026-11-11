import { ASYNC_STORAGE_CONFIG_KEY } from "@/constants";
import { Config } from "@/types/config.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const saveConfig = async (config: Config): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      ASYNC_STORAGE_CONFIG_KEY,
      JSON.stringify(config),
    );
  } catch (error) {
    console.error("Error occurred while saving config:", error);
    throw new Error("Failed to save config", { cause: error });
  }
};

const getConfig = async (): Promise<Config | null> => {
  try {
    const raw = await AsyncStorage.getItem(ASYNC_STORAGE_CONFIG_KEY);

    if (!raw) {
      return null
    }

    const config = JSON.parse(raw) as Config;

    return config;
  } catch (error) {
    console.error("Error occurred while retrieving config:", error);
    throw new Error("Failed to retrieve config", { cause: error });
  }
};

export { getConfig, saveConfig };

