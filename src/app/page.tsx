import { getDrills } from "@/features/drills/api/getDrills";
import { DrillCard } from "@/features/drills/components/DrillCard";
import { TagFilter } from "@/features/drills/components/TagFilter";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string }>;
}) {
  const params = await searchParams;
  const drills = await getDrills();

  // Extract unique tags
  const allTags = Array.from(new Set(drills.flatMap((drill) => drill.tags || []))).sort();

  // Parse selected tags from URL (comma separated)
  const selectedTags = params.tags ? params.tags.split(",").filter(Boolean) : [];

  // Filter drills: Must include ALL selected tags (AND condition)
  const filteredDrills = drills.filter((drill) => {
    if (selectedTags.length === 0) return true;
    return selectedTags.every((selectedTag) => drill.tags?.includes(selectedTag));
  });

  // Calculate disabled tags (Zero-hit prevention)
  const disabledTags = allTags.filter((tag) => {
    // If already selected, not disabled (can be removed)
    if (selectedTags.includes(tag)) return false;

    // Hypothetically select this tag
    const nextSelectedTags = [...selectedTags, tag];

    // Check if any drill matches ALL new conditions
    const matchCount = drills.filter((drill) => {
      return nextSelectedTags.every((t) => drill.tags?.includes(t));
    }).length;

    return matchCount === 0;
  });

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
