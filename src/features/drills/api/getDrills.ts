import { client } from "@/lib/microcms";
import type { Drill } from "../types";

export const getDrills = async (): Promise<Drill[]> => {
    const data = await client.getList<Drill>({
        endpoint: "drills",
        queries: {
            limit: 100, // Assuming not too many drills for now
        },
    });
    return data.contents;
};

export const getDrill = async (contentId: string): Promise<Drill | null> => {
    const data = await client.getListDetail<Drill>({
        endpoint: "drills",
        contentId,
    });
    return data;
};
