import type { MetadataRoute } from "next";
import { getDrills } from "../features/drills/api/getDrills";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://fruits-drill.vercel.app";
  const drills = await getDrills();

  const drillUrls: MetadataRoute.Sitemap = drills.map((drill) => ({
    url: `${baseUrl}/drills/${drill.id}`,
    lastModified: new Date(drill.revisedAt || drill.publishedAt || new Date()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  return [...staticUrls, ...drillUrls];
}
