import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Apple, Grape, Leaf, BookOpen, Citrus, Download } from "lucide-react";
import type { Drill } from "../types";
import { getFruitTheme } from "@/features/drills/utils/filterDrills";

type Props = {
  drill: Drill;
  priority?: boolean;
  queryParams?: string;
};

const IconMap = {
  apple: Apple,
  citrus: Citrus, // Used for Math (Orange theme)
  grape: Grape,
  leaf: Leaf,
  book: BookOpen,
};

export const DrillCard = memo(({ drill, priority = false, queryParams = "" }: Props) => {
  return (
    <Link
      href={`/drills/${drill.id}${queryParams}`}
      className="group block overflow-hidden rounded-[2rem] bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-border/60 hover:border-rose-200"
    >
      <div className="aspect-square w-full overflow-hidden bg-secondary/30 relative">
        <Image
          src={drill.thumbnail.url}
          alt={drill.title}
          fill
          priority={priority}
          className="object-cover object-left-top transition-transform duration-500 scale-100 group-hover:scale-110"
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick Download Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(drill.pdf, "_blank");
          }}
          className="absolute bottom-3 right-3 p-2.5 bg-white/90 hover:bg-rose-500 hover:text-white text-rose-600 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 z-10"
          title="直接ダウンロード"
          aria-label={`${drill.title}をダウンロード`}
        >
          <Download size={20} className="stroke-[2.5px]" />
        </button>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
          {drill.title}
        </h3>
        {drill.tags && drill.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {drill.tags.map((tag) => {
              const theme = getFruitTheme(tag);
              const Icon = IconMap[theme.iconName];
              return (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${theme.bgColor} ${theme.color}`}
                >
                  <Icon size={12} className="stroke-[2.5px]" />
                  {tag}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
});

DrillCard.displayName = "DrillCard";
