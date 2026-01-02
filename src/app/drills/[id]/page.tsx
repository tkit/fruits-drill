import { getDrill, getDrills } from "@/features/drills/api/getDrills";
import { DrillDetail } from "@/features/drills/components/DrillDetail";
import { filterDrills } from "@/features/drills/utils/filterDrills";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tags?: string; q?: string }>;
};

// Generate static params for static export if needed, or better performance
export async function generateStaticParams() {
  const drills = await getDrills();
  return drills.map((drill) => ({
    id: drill.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const drill = await getDrill(id);

  if (!drill) {
    return {
      title: "お探しのドリルは見つかりませんでした",
    };
  }

  const title = drill.title;
  const description =
    drill.description || `${title}の無料学習プリントです。ダウンロードして印刷して使えます。`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
    },
    twitter: {
      title: title,
      description: description,
    },
  };
}

export default async function DrillPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tags, q } = await searchParams;
  const drill = await getDrill(id);

  if (!drill) {
    notFound();
  }

  // Calculate next/prev navigation
  const allDrills = await getDrills();

  // Apply filters to match list view context
  const selectedTags = tags ? tags.split(",").filter(Boolean) : [];
  let filteredDrills = filterDrills(allDrills, selectedTags);

  if (q) {
    const lowerQuery = q.toLowerCase().trim();
    filteredDrills = filteredDrills.filter((d) => {
      // Search in title
      if (d.title.toLowerCase().includes(lowerQuery)) return true;
      // Search in tags
      if (d.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))) return true;
      return false;
    });
  }

  const currentIndex = filteredDrills.findIndex((d) => d.id === drill.id);
  const prevDrill = currentIndex > 0 ? filteredDrills[currentIndex - 1] : null;
  const nextDrill =
    currentIndex < filteredDrills.length - 1 ? filteredDrills[currentIndex + 1] : null;

  // Reconstruct query string for navigation links
  const queryParams = new URLSearchParams();
  if (tags) queryParams.set("tags", tags);
  if (q) queryParams.set("q", q);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href={`/${queryString}`}
        className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        一覧に戻る
      </Link>
      <DrillDetail
        drill={drill}
        prevDrillId={prevDrill?.id}
        nextDrillId={nextDrill?.id}
        queryParams={queryString}
      />
    </div>
  );
}
