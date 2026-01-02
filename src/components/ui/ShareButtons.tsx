"use client";

import { Check, Copy } from "lucide-react";
import { useState, useEffect } from "react";

type Props = {
  title: string;
  url?: string;
};

export const ShareButtons = ({
  title,
  url: initialUrl,
  size = "default",
  showLabel = true,
}: Props & {
  size?: "sm" | "default";
  showLabel?: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(initialUrl || "");

  useEffect(() => {
    if (!initialUrl && typeof window !== "undefined") {
      const timer = setTimeout(() => {
        setShareUrl(window.location.href);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(shareUrl)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`;

  if (!shareUrl) return null;

  const buttonClass =
    size === "sm"
      ? "flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform hover:-translate-y-1 hover:shadow-md"
      : "flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform hover:-translate-y-1 hover:shadow-lg";

  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const lineIconClass = size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <div className={`flex items-center gap-4 ${showLabel ? "flex-col" : "flex-row"}`}>
      {showLabel && <p className="text-sm font-bold text-gray-500">この問題をシェアする</p>}
      <div className="flex gap-4">
        {/* Twitter (X) */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} bg-black`}
          aria-label="Share on X (Twitter)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className={`${iconClass} fill-current`}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>

        {/* LINE */}
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClass} bg-[#06C755]`}
          aria-label="Share on LINE"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className={`${lineIconClass} fill-current`}>
            <path d="M20.25 10.7c0-4.14-4.59-7.5-10.25-7.5S-.25 6.56-.25 10.7c0 3.7 3.65 6.8 8.58 7.36.33.07.78.22.9.5.1.23.06.58-.02 1.01l-.25 1.48c-.08.45-.36 1.76 1.54.96 1.91-.8 5.17-3.04 7.05-5.21 1.63-1.84 2.5-3.92 2.5-6.1z" />
          </svg>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          className={`${buttonClass} bg-gray-100 text-gray-600 hover:bg-gray-200`}
          aria-label="Copy Link"
        >
          {copied ? <Check className={iconClass} /> : <Copy className={iconClass} />}
        </button>
      </div>
    </div>
  );
};
