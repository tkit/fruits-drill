import Image from "next/image";
import Link from "next/link";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { ShareButtons } from "@/components/ui/ShareButtons";
import type { Drill } from "../types";

type Props = {
  drill: Drill;
  prevDrillId?: string;
  nextDrillId?: string;
  queryParams?: string;
};

export const DrillDetail = ({ drill, prevDrillId, nextDrillId, queryParams = "" }: Props) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg border-4 border-amber-100 mb-8">
        <div className="relative aspect-[16/9] w-full bg-amber-50">
          <Image
            src={drill.thumbnail.url}
            alt={drill.title}
            fill
            priority
            className="object-contain p-4"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>

        <div className="p-4 flex flex-col items-center text-center space-y-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{drill.title}</h1>
            {drill.description && (
              <p className="text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
                {drill.description}
              </p>
            )}
          </div>

          {drill.tags && (
            <div className="flex flex-wrap gap-2 justify-center">
              {drill.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="w-full flex flex-col items-center gap-2 mt-2">
            <div className="flex justify-center items-center gap-4">
              <a
                href={drill.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm py-2 px-6 rounded-full shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                ダウンロード (解答付き)
              </a>

              <ShareButtons
                title={`${drill.title} | ふるーつドリル`}
                url={typeof window !== "undefined" ? window.location.href : ""}
                size="sm"
                showLabel={false}
              />
            </div>
            <p className="text-xs text-gray-500">※ 最後のページに解答がついています</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex justify-between items-center px-2 mt-4 pb-4">
        {prevDrillId ? (
          <Link
            href={`/drills/${prevDrillId}${queryParams}`}
            className="group flex items-center bg-white/90 hover:bg-white text-rose-600 px-4 py-2.5 rounded-full shadow-sm hover:shadow-md backdrop-blur-sm border border-rose-100 transition-all duration-300 transform hover:-translate-x-1"
          >
            <ChevronLeft className="w-5 h-5 mr-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm">前のドリル</span>
          </Link>
        ) : (
          <div /> // Spacer
        )}

        {nextDrillId ? (
          <Link
            href={`/drills/${nextDrillId}${queryParams}`}
            className="group flex items-center bg-white/90 hover:bg-white text-rose-600 px-4 py-2.5 rounded-full shadow-sm hover:shadow-md backdrop-blur-sm border border-rose-100 transition-all duration-300 transform hover:translate-x-1"
          >
            <span className="font-bold text-sm">次のドリル</span>
            <ChevronRight className="w-5 h-5 ml-1 group-hover:scale-110 transition-transform" />
          </Link>
        ) : (
          <div /> // Spacer
        )}
      </div>
    </div>
  );
};
