import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";

async function handleRevalidate(tag: string | null): Promise<NextResponse> {
  if (!tag) {
    return NextResponse.json({ message: "Missing tag param" }, { status: 400 });
  }

  revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: true, tag, now: Date.now() });
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tag = request.nextUrl.searchParams.get("tag");
  return handleRevalidate(tag);
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: { tag?: string };
  try {
    body = (await request.json()) as { tag?: string };
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  return handleRevalidate(body.tag ?? null);
}
