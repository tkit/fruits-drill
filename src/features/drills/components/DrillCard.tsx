import Link from "next/link";
import Image from "next/image";
import type { Drill } from "../types";

type Props = {
  drill: Drill;
};

export const DrillCard = ({ drill }: Props) => {
  return (
    <Link
      href={`/drills/${drill.id}`}
      className="group block overflow-hidden rounded-3xl bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1 border border-orange-100"
    >
      <div className="aspect-square w-full overflow-hidden bg-amber-50 relative">
        <Image
          src={drill.thumbnail.url}
          alt={drill.title}
          fill
          className="object-cover object-left-top transition-transform duration-300 scale-150 origin-top-left group-hover:scale-[1.6]"
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-rose-600 transition-colors line-clamp-2">
          {drill.title}
        </h3>
        {drill.tags && drill.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {drill.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};
