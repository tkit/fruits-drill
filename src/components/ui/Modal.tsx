"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useCallback, useRef } from "react";

export const Modal = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current || e.target === wrapperRef.current) {
        if (onDismiss) onDismiss();
      }
    },
    [onDismiss, overlayRef, wrapperRef]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <div
      ref={overlayRef}
      onClick={onClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        ref={wrapperRef}
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-transparent animate-in zoom-in-95 duration-200"
      >
        <div className="relative flex-1 overflow-y-auto rounded-3xl no-scrollbar">
          <button
            onClick={onDismiss}
            className="fixed z-50 top-4 right-4 md:absolute md:top-4 md:right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm touch-manipulation"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};
