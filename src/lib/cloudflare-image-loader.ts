"use client";

import type { ImageLoaderProps } from "next/image";

export default function cloudflareImageLoader({ src, width, quality }: ImageLoaderProps): string {
  void width;
  void quality;
  return src;
}
