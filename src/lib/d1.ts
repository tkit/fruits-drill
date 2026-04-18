import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Drill } from "@/features/drills/types";
import { resolveDrillAssetUrl } from "@/lib/asset-url";

type DrillListRow = {
  id: string;
  title: string;
  thumbnail_url: string;
  pdf_url: string;
  created_at: string | null;
  tags_concat: string | null;
};

type DrillDetailRow = {
  id: string;
  title: string;
  thumbnail_url: string;
  pdf_url: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  tags_concat: string | null;
};

const TAG_SEPARATOR = "\u001f";

async function getD1Database(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as CloudflareEnv & { DB?: D1Database }).DB;

  if (!db) {
    throw new Error("Missing D1 binding `DB`. Configure `wrangler.toml` d1_databases first.");
  }

  return db;
}

function parseTags(tagsConcat: string | null): string[] {
  if (!tagsConcat) return [];
  return tagsConcat
    .split(TAG_SEPARATOR)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function fetchDrillsFromD1(): Promise<Drill[]> {
  const db = await getD1Database();

  const { results } = await db
    .prepare(
      `
      SELECT
        d.id,
        d.title,
        d.thumbnail_url,
        d.pdf_url,
        d.created_at,
        (
          SELECT group_concat(t.name, ?1)
          FROM drill_tags dt
          JOIN tags t ON t.id = dt.tag_id
          WHERE dt.drill_id = d.id
        ) AS tags_concat
      FROM drills d
      ORDER BY d.created_at DESC
      `
    )
    .bind(TAG_SEPARATOR)
    .all<DrillListRow>();

  return (results ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    thumbnail: {
      url: resolveDrillAssetUrl(row.thumbnail_url),
    },
    pdf: resolveDrillAssetUrl(row.pdf_url),
    tags: parseTags(row.tags_concat),
    description: undefined,
    publishedAt: row.created_at ?? undefined,
    revisedAt: row.created_at ?? undefined,
  }));
}

export async function fetchDrillFromD1(contentId: string): Promise<Drill | null> {
  const db = await getD1Database();

  const row = await db
    .prepare(
      `
      SELECT
        d.id,
        d.title,
        d.thumbnail_url,
        d.pdf_url,
        d.description,
        d.created_at,
        d.updated_at,
        (
          SELECT group_concat(t.name, ?1)
          FROM drill_tags dt
          JOIN tags t ON t.id = dt.tag_id
          WHERE dt.drill_id = d.id
        ) AS tags_concat
      FROM drills d
      WHERE d.id = ?2
      LIMIT 1
      `
    )
    .bind(TAG_SEPARATOR, contentId)
    .first<DrillDetailRow>();

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    thumbnail: {
      url: resolveDrillAssetUrl(row.thumbnail_url),
    },
    pdf: resolveDrillAssetUrl(row.pdf_url),
    description: row.description ?? undefined,
    tags: parseTags(row.tags_concat),
    publishedAt: row.created_at ?? undefined,
    revisedAt: row.updated_at ?? row.created_at ?? undefined,
  };
}
