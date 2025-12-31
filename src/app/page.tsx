import { getDrills } from "@/features/drills/api/getDrills";
import { getAllTags } from "@/features/drills/utils/filterDrills";
import { DrillListContainer } from "@/features/drills/components/DrillListContainer";

export default async function Home({ searchParams }: { searchParams: Promise<{ tags?: string }> }) {
  const params = await searchParams;
  const drills = await getDrills();

  // Extract unique tags
  const allTags = getAllTags(drills);

  // Parse selected tags from URL (comma separated)
  const selectedTags = params.tags ? params.tags.split(",").filter(Boolean) : [];

  return (
    <div className="space-y-10">
      <section className="text-center space-y-4 py-8">
        <h1 className="text-2xl md:text-4xl font-bold text-rose-600 tracking-tight">
          楽しく学べる！ふるーつドリル
        </h1>
        <p className="text-lg text-gray-600">
          小学生向けの無料プリント学習サイトです。
          <br />
          毎日の学習習慣づくりに、ぜひご活用ください。
        </p>
      </section>

      <DrillListContainer
        drills={drills}
        allTags={allTags}
        initialSelectedTags={selectedTags}
      />
    </div>
  );
}
