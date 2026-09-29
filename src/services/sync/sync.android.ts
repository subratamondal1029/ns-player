import { Timestamp } from "@/types/timestamp.types";
import { apiFetch } from "@/utils/fetchWrapper";

const syncTimestamp = async (
  isSending: boolean,
  timestamp: Timestamp,
  url: string,
): Promise<Timestamp> => {
  try {
    if (isSending) {
      if (!timestamp) {
        throw new Error("Timestamp is required");
      }

      await apiFetch(`${url}/api/sync`, {
        method: "PUT",
        body: JSON.stringify(timestamp),
        headers: {
          "Content-Type": "application/json",
        },
      });

      return timestamp;
    } else {
      const res = await apiFetch<Timestamp>(
        `${url}/api/sync?playlist=${encodeURIComponent(timestamp.playlist)}`,
      );
      return res;
    }
  } catch (error) {
    throw new Error("Failed to sync timestamp", { cause: error });
  }
};

export { syncTimestamp };
