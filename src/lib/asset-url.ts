const DEFAULT_BASE_URL = "https://fruits-drill.stdy.workers.dev";
const R2_SCHEME = "r2://";

function getBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function resolveDrillAssetUrl(rawValue: string): string {
  if (/^https?:\/\//i.test(rawValue)) return rawValue;

  const key = rawValue.startsWith(R2_SCHEME) ? rawValue.slice(R2_SCHEME.length) : rawValue;
  const normalizedKey = key.replace(/^\/+/, "");

  if (!normalizedKey) return rawValue;

  const encodedPath = normalizedKey
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${getBaseUrl()}/api/files/${encodedPath}`;
}

export function toR2Reference(key: string): string {
  return `${R2_SCHEME}${key.replace(/^\/+/, "")}`;
}

export function extractR2Key(rawValue: string): string | null {
  if (!rawValue) return null;

  if (rawValue.startsWith(R2_SCHEME)) {
    return rawValue.slice(R2_SCHEME.length).replace(/^\/+/, "");
  }

  if (/^https?:\/\//i.test(rawValue)) return null;

  return rawValue.replace(/^\/+/, "");
}
