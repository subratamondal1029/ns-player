import { SERVER_URL } from "@/constants";

const syncTimestamp = async (): Promise<string> => {
  try {
    const response = await fetch(`${SERVER_URL}/sync/qr`);

    if (!response.ok) {
      throw new Error("Failed to sync timestamp");
    }

    const blob = await response.blob();
    const uri = URL.createObjectURL(blob);
    return uri;
  } catch (error) {
    throw new Error("Failed to sync timestamp", { cause: error });
  }
};

export { syncTimestamp };
