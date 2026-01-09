import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");
  const secret = request.nextUrl.searchParams.get("secret");

  if (!secret || secret !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  if (!tag) {
    return NextResponse.json({ message: "Missing tag param" }, { status: 400 });
  }

  // "max" argument is required in newer Next.js versions to silence deprecation warning
  // and indicates immediate invalidation.
  // @ts-ignore - The types might not be updated yet in all environments
  revalidateTag(tag, "max"); 

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
