import { supabase } from "@/lib/supabase";
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
        // Join drills and drill_tags -> tags
        // Select only necessary columns for the list view
        const { data: drills, error } = await supabase
          .from("drills")
          .select(
            `
                id,
                title,
                thumbnail_url,
                pdf_url,
                created_at,
                drill_tags (
                    tags (
                        name
                    )
                )
            `
          )
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        if (!drills) return [];

        return drills.map((d) => ({
          id: d.id,
          title: d.title,
          thumbnail: {
            url: d.thumbnail_url,
          },
          pdf: d.pdf_url,
          description: undefined, // List view generally doesn't show description
          tags: d.drill_tags?.map((dt) => dt.tags?.name).filter(Boolean) || [],
          publishedAt: d.created_at,
          revisedAt: d.created_at,
        }));
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
  const { data: drill, error } = await supabase
    .from("drills")
    .select(
      `
            *,
            drill_tags (
                tags (
                    name
                )
            )
        `
    )
    .eq("id", contentId)
    .single();

  if (error || !drill) {
    console.error("Failed to fetch drill:", error);
    return null;
  }

  return {
    id: drill.id,
    title: drill.title,
    thumbnail: {
      url: drill.thumbnail_url,
    },
    pdf: drill.pdf_url,
    description: drill.description || undefined,
    tags: drill.drill_tags?.map((dt) => dt.tags?.name).filter(Boolean) || [],
    publishedAt: drill.created_at,
    revisedAt: drill.created_at || undefined,
  };
};
