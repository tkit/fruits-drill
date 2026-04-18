import { fetchDrillFromD1, fetchDrillsFromD1 } from "@/lib/d1";
import type { Drill } from "../types";

import { unstable_cache } from "next/cache";

export const getDrills = unstable_cache(
  async (): Promise<Drill[]> => {
    // Retry logic configuration
    const MAX_RETRIES = 3;
    const INITIAL_RETRY_DELAY = 500; // ms

    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await fetchDrillsFromD1();
      } catch (err) {
        console.error(`Attempt ${attempt + 1} failed:`, err);
        lastError = err;

        // Calculate delay with exponential backoff
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);

        if (attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries fail, rethrow the last error
    // This ensures unstable_cache doesn't cache the "empty" result
    console.error("All retry attempts failed for getDrills");
    throw lastError;
  },
  ["drills-list"],
  {
    revalidate: 60,
    tags: ["drills"],
  }
);

export const getDrill = async (contentId: string): Promise<Drill | null> => {
  try {
    return await fetchDrillFromD1(contentId);
  } catch (error) {
    console.error("Failed to fetch drill:", error);
    return null;
  }
};
