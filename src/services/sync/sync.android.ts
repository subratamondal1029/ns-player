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

    const res = await apiFetch<Timestamp | null>(`${url}/api/sync`, {
      method: "PUT",
      body: JSON.stringify(timestamp),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res;
  } catch (error) {
    throw new Error("Failed to sync timestamp", { cause: error });
  }
};

export { syncTimestamp };
