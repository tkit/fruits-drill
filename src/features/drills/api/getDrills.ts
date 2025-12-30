import { supabase } from "@/lib/supabase";
import type { Drill } from "../types";

import { unstable_cache } from "next/cache";

export const getDrills = unstable_cache(
    async (): Promise<Drill[]> => {
        // Join drills and drill_tags -> tags
        // Select only necessary columns for the list view
        const { data: drills, error } = await supabase
            .from("drills")
            .select(`
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
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Failed to fetch drills:", error);
            return [];
        }

        if (!drills) return [];

        return drills.map((d: any) => ({
            id: d.id,
            title: d.title,
            thumbnail: {
                url: d.thumbnail_url,
            },
            pdf: d.pdf_url,
            description: undefined, // List view generally doesn't show description
            tags: d.drill_tags?.map((dt: any) => dt.tags?.name).filter(Boolean) || [],
            publishedAt: d.created_at,
            revisedAt: d.created_at,
        }));
    },
    ["drills-list"],
    {
        revalidate: 3600,
        tags: ["drills"],
    }
);

export const getDrill = async (contentId: string): Promise<Drill | null> => {
    const { data: drill, error } = await supabase
        .from("drills")
        .select(`
            *,
            drill_tags (
                tags (
                    name
                )
            )
        `)
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
        description: drill.description,
        tags: drill.drill_tags?.map((dt: any) => dt.tags?.name).filter(Boolean) || [],
        publishedAt: drill.created_at,
        revisedAt: drill.created_at,
    };
};

