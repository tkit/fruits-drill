import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { toR2Reference } from "@/lib/asset-url";

type RegisterBody = {
  id?: string;
  title?: string;
  description?: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  pdfKey?: string;
  thumbnailKey?: string;
  pdfBase64?: string;
  thumbnailBase64?: string;
  tags?: string[];
};

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];

  return Array.from(
    new Set(
      tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

function normalizeAssetReference(url?: string, key?: string): string | null {
  const normalizedKey = normalizeText(key);
  if (normalizedKey) return toR2Reference(normalizedKey);

  const normalizedUrl = normalizeText(url);
  if (normalizedUrl) return normalizedUrl;

  return null;
}

async function upsertTag(db: D1Database, tagName: string): Promise<string> {
  const existing = await db
    .prepare(`SELECT id FROM tags WHERE name = ?1 LIMIT 1`)
    .bind(tagName)
    .first<{
      id: string;
    }>();
  if (existing?.id) return existing.id;

  const id = crypto.randomUUID();
  await db
    .prepare(
      `
      INSERT INTO tags (id, name, created_at)
      VALUES (?1, ?2, CURRENT_TIMESTAMP)
      `
    )
    .bind(id, tagName)
    .run();
  return id;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let payload: RegisterBody;
  try {
    payload = (await request.json()) as RegisterBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const title = normalizeText(payload.title);
  if (!title) {
    return NextResponse.json({ message: "Missing title" }, { status: 400 });
  }

  const pdfRef = normalizeAssetReference(payload.pdfUrl, payload.pdfKey);
  const thumbnailRef = normalizeAssetReference(payload.thumbnailUrl, payload.thumbnailKey);

  if (!pdfRef || !thumbnailRef) {
    return NextResponse.json(
      {
        message: "Missing asset reference. Provide pdfUrl/pdfKey and thumbnailUrl/thumbnailKey.",
      },
      { status: 400 }
    );
  }

  const tags = normalizeTags(payload.tags);
  const description = normalizeText(payload.description) ?? null;

  const { env } = await getCloudflareContext({ async: true });
  const db = (env as CloudflareEnv & { DB?: D1Database }).DB;
  const bucket = (env as CloudflareEnv & { DRILL_FILES?: R2Bucket }).DRILL_FILES;
  if (!db) {
    return NextResponse.json({ message: "Missing D1 binding `DB`" }, { status: 500 });
  }
  if (!bucket) {
    return NextResponse.json({ message: "Missing R2 binding `DRILL_FILES`" }, { status: 500 });
  }

  const pdfKey = normalizeText(payload.pdfKey);
  const thumbnailKey = normalizeText(payload.thumbnailKey);
  const pdfBase64 = normalizeText(payload.pdfBase64);
  const thumbnailBase64 = normalizeText(payload.thumbnailBase64);

  if (pdfBase64 && pdfKey) {
    await bucket.put(pdfKey, Uint8Array.from(Buffer.from(pdfBase64, "base64")), {
      httpMetadata: { contentType: "application/pdf" },
    });
  }
  if (thumbnailBase64 && thumbnailKey) {
    await bucket.put(thumbnailKey, Uint8Array.from(Buffer.from(thumbnailBase64, "base64")), {
      httpMetadata: { contentType: "image/png" },
    });
  }

  const existing = await db
    .prepare(`SELECT id FROM drills WHERE pdf_url = ?1 LIMIT 1`)
    .bind(pdfRef)
    .first<{ id: string }>();

  const drillId = existing?.id ?? normalizeText(payload.id) ?? crypto.randomUUID();

  if (existing?.id) {
    await db
      .prepare(
        `
        UPDATE drills
        SET title = ?1, description = ?2, thumbnail_url = ?3, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?4
        `
      )
      .bind(title, description, thumbnailRef, drillId)
      .run();
    await db.prepare(`DELETE FROM drill_tags WHERE drill_id = ?1`).bind(drillId).run();
  } else {
    await db
      .prepare(
        `
        INSERT INTO drills (id, title, description, pdf_url, thumbnail_url, created_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `
      )
      .bind(drillId, title, description, pdfRef, thumbnailRef)
      .run();
  }

  for (const tagName of tags) {
    const tagId = await upsertTag(db, tagName);
    await db
      .prepare(
        `
        INSERT OR IGNORE INTO drill_tags (drill_id, tag_id)
        VALUES (?1, ?2)
        `
      )
      .bind(drillId, tagId)
      .run();
  }

  return NextResponse.json({
    id: drillId,
    created: !existing,
    updated: Boolean(existing),
    tagsCount: tags.length,
  });
}
