import { getDrills } from "@/features/drills/api/getDrills";
import { DrillCard } from "@/features/drills/components/DrillCard";
import { TagFilter } from "@/features/drills/components/TagFilter";
import {
  getAllTags,
  filterDrills,
  calculateDisabledTags
} from "@/features/drills/utils/filterDrills";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string }>;
}) {
  const params = await searchParams;
  const drills = await getDrills();

  // Extract unique tags
  const allTags = getAllTags(drills);

  // Parse selected tags from URL (comma separated)
  const selectedTags = params.tags ? params.tags.split(",").filter(Boolean) : [];

  // Filter drills: Must include ALL selected tags (AND condition)
  const filteredDrills = filterDrills(drills, selectedTags);

  // Calculate disabled tags (Zero-hit prevention)
  const disabledTags = calculateDisabledTags(drills, selectedTags, allTags);

  return (
    <div className="space-y-10">
      <section className="text-center space-y-4 py-8">
        <h1 className="text-2xl md:text-4xl font-bold text-rose-600 tracking-tight">
          楽しく学べる！ふるーつドリル
        </h1>
        <p className="text-lg text-gray-600">
          小学生向けの無料プリント学習サイトです。<br />
          毎日の学習習慣づくりに、ぜひご活用ください。
        </p>
      </section>

      <section className="flex justify-center">
        <TagFilter
          allTags={allTags}
          selectedTags={selectedTags}
          disabledTags={disabledTags}
        />
      </section>

      <section>
        {filteredDrills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDrills.map((drill) => (
              <DrillCard key={drill.id} drill={drill} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            条件に一致するドリルは見つかりませんでした。
          </div>
        )}
      </section>
    </div>
  );
}
