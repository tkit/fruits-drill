"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">エラーが発生しました</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          ドリルデータの取得中に問題が発生しました。
          <br />
          時間をおいて再度お試しください。
        </p>
      </div>

      <Button
        onClick={() => reset()}
        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-2 rounded-full transition-colors"
      >
        再読み込み
      </Button>
    </div>
  );
}
