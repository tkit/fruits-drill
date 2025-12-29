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
                className="relative w-full max-w-2xl bg-transparent animate-in zoom-in-95 duration-200"
            >
                <button
                    onClick={onDismiss}
                    className="absolute -top-12 right-0 md:-right-12 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                    aria-label="Close modal"
                >
                    <X className="w-8 h-8" />
                </button>
                {children}
            </div>
        </div>
    );
};
