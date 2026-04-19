const R2_SCHEME = "r2://";

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

  return `/api/files/${encodedPath}`;
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
