import { ASYNC_STORAGE_DIR_KEY } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const saveDir = async (dirUri: string) => {
  try {
    await AsyncStorage.setItem(
      ASYNC_STORAGE_DIR_KEY,
      JSON.stringify({ uri: dirUri }),
    );
  } catch (error) {
    throw new Error("Dir save failed", { cause: error });
  }
};

const loadDir = async (): Promise<{ uri: string } | null> => {
  try {
    const dirJson = await AsyncStorage.getItem(ASYNC_STORAGE_DIR_KEY);

    if (dirJson) {
      return JSON.parse(dirJson);
    } else return null;
  } catch (error) {
    throw new Error("Dir load failed", { cause: error });
  }
};

export { loadDir, saveDir };
