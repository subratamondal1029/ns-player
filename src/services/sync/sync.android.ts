import { Timestamp } from "@/types/timestamp.types";
import { apiFetch } from "@/utils/fetchWrapper";

const syncTimestamp = async (
  timestamp: Timestamp,
  url: string,
): Promise<Timestamp | null> => {
  try {
    if (!timestamp) {
      throw new Error("Timestamp is required");
    }

    const updatedTimestamp = (await apiFetch(`${url}/api/sync`, {
      method: "POST",
      body: JSON.stringify(timestamp),
      headers: {
        "Content-Type": "application/json",
      },
    })) as Timestamp | null;

    return updatedTimestamp;
  } catch (error) {
    throw new Error("Failed to sync timestamp", { cause: error });
  }
};

export { syncTimestamp };
