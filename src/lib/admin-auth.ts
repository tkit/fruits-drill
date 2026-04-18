import { type NextRequest } from "next/server";

function getExpectedAdminToken(): string | undefined {
  return process.env.ADMIN_API_TOKEN;
}

function getBearerToken(request: NextRequest): string | undefined {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return undefined;

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return undefined;

  return token.trim();
}

export function isAuthorizedAdminRequest(request: NextRequest): boolean {
  const expectedToken = getExpectedAdminToken();
  if (!expectedToken) return false;

  const bearerToken = getBearerToken(request);
  if (bearerToken && bearerToken === expectedToken) return true;

  const xAdminToken = request.headers.get("x-admin-token")?.trim();
  if (xAdminToken && xAdminToken === expectedToken) return true;

  return false;
}
