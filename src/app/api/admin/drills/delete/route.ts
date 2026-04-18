import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";
import { extractR2Key } from "@/lib/asset-url";

type DeleteBody = {
  id?: string;
  title?: string;
  pdfRef?: string;
  deleteFiles?: boolean;
};

type DrillRow = {
  id: string;
  title: string;
  pdf_url: string;
  thumbnail_url: string;
};

function normalizeText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let payload: DeleteBody;
  try {
    payload = (await request.json()) as DeleteBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const id = normalizeText(payload.id);
  const title = normalizeText(payload.title);
  const pdfRef = normalizeText(payload.pdfRef);
  const deleteFiles = payload.deleteFiles !== false;

  if (!id && !title && !pdfRef) {
    return NextResponse.json(
      { message: "Missing selector. Provide id, title, or pdfRef." },
      { status: 400 }
    );
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = (env as CloudflareEnv & { DB?: D1Database }).DB;
  const bucket = (env as CloudflareEnv & { DRILL_FILES?: R2Bucket }).DRILL_FILES;

  if (!db) {
    return NextResponse.json({ message: "Missing D1 binding `DB`" }, { status: 500 });
  }

  let drill: DrillRow | null = null;
  if (id) {
    drill = await db
      .prepare(`SELECT id, title, pdf_url, thumbnail_url FROM drills WHERE id = ?1 LIMIT 1`)
      .bind(id)
      .first<DrillRow>();
  } else if (title) {
    drill = await db
      .prepare(`SELECT id, title, pdf_url, thumbnail_url FROM drills WHERE title = ?1 LIMIT 1`)
      .bind(title)
      .first<DrillRow>();
  } else if (pdfRef) {
    drill = await db
      .prepare(`SELECT id, title, pdf_url, thumbnail_url FROM drills WHERE pdf_url = ?1 LIMIT 1`)
      .bind(pdfRef)
      .first<DrillRow>();
  }

  if (!drill) {
    return NextResponse.json({ message: "Drill not found" }, { status: 404 });
  }

  await db.prepare(`DELETE FROM drill_tags WHERE drill_id = ?1`).bind(drill.id).run();
  await db.prepare(`DELETE FROM drills WHERE id = ?1`).bind(drill.id).run();
  await db
    .prepare(`DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM drill_tags)`)
    .run();

  const deletedKeys: string[] = [];
  if (deleteFiles && bucket) {
    const keys = [extractR2Key(drill.pdf_url), extractR2Key(drill.thumbnail_url)].filter(
      (key): key is string => Boolean(key)
    );

    for (const key of keys) {
      await bucket.delete(key);
      deletedKeys.push(key);
    }
  }

  return NextResponse.json({
    deleted: true,
    id: drill.id,
    title: drill.title,
    deletedKeys,
  });
}
