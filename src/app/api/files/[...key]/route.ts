import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

type Params = {
  key: string[];
};

function inferContentTypeFromKey(key: string): string {
  const lowerKey = key.toLowerCase();

  if (lowerKey.endsWith(".pdf")) return "application/pdf";
  if (lowerKey.endsWith(".png")) return "image/png";
  if (lowerKey.endsWith(".jpg") || lowerKey.endsWith(".jpeg")) return "image/jpeg";
  if (lowerKey.endsWith(".webp")) return "image/webp";

  return "application/octet-stream";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> }
): Promise<NextResponse> {
  const { key } = await params;
  const objectKey = key.join("/");

  if (!objectKey) {
    return NextResponse.json({ message: "Missing object key" }, { status: 400 });
  }

  const { env } = await getCloudflareContext({ async: true });
  const bucket = (env as CloudflareEnv & { DRILL_FILES?: R2Bucket }).DRILL_FILES;

  if (!bucket) {
    return NextResponse.json(
      { message: "Missing R2 binding `DRILL_FILES` in worker environment" },
      { status: 500 }
    );
  }

  const object = await bucket.get(objectKey);
  if (!object) {
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  if (!headers.has("content-type")) {
    headers.set("content-type", inferContentTypeFromKey(objectKey));
  }
  headers.set("cache-control", "public, max-age=3600");

  return new NextResponse(object.body, { headers });
}
