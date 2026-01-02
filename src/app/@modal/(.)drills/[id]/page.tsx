import { getDrill, getDrills } from "@/features/drills/api/getDrills";
import { DrillDetail } from "@/features/drills/components/DrillDetail";
import { filterDrills } from "@/features/drills/utils/filterDrills";
import { Modal } from "@/components/ui/Modal";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tags?: string; q?: string }>;
};

export default async function DrillModalPage({ params, searchParams }: Props) {
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
    <Modal>
      <DrillDetail
        drill={drill}
        prevDrillId={prevDrill?.id}
        nextDrillId={nextDrill?.id}
        queryParams={queryString}
        useReplaceNavigation={true}
      />
    </Modal>
  );
}
