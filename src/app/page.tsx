import { getDrills } from "@/features/drills/api/getDrills";
import { getAllTags } from "@/features/drills/utils/filterDrills";
import { DrillListContainer } from "@/features/drills/components/DrillListContainer";
import Image from "next/image";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string; page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const drills = await getDrills();

  // Extract unique tags
  const allTags = getAllTags(drills);

  // Parse parameters
  const selectedTags = params.tags ? params.tags.split(",").filter(Boolean) : [];
  const currentPage = Number(params.page) || 1;
  const currentQuery = params.q || "";

  return (
    <div className="space-y-10">
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
          <div className="space-y-6 text-center md:text-left max-w-lg">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100/80 text-rose-700 font-bold text-sm tracking-wide">
                \ 無料で使える学習プリント /
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-rose-600 tracking-tight leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-orange-500 pb-2">
                  ふるーつドリル
                </span>
              </h1>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed font-medium">
              ニガテな単元も、得意な教科も。
              <br />
              全てのドリルに解答付きで丸付けも簡単。
              <br />
              ご家庭で自由に印刷して使える、
              <br />
              小学生向け無料ドリルサイトです。
            </p>
          </div>

          <div className="relative w-64 h-64 md:w-96 md:h-96 flex-shrink-0 animate-in fade-in zoom-in duration-1000">
            <div className="absolute inset-0 bg-rose-200/20 blur-3xl rounded-full" />
            <Image
              src="/images/hero-growth.png"
              alt="Sprouting plant watercolor illustration"
              className="object-contain mix-blend-multiply"
              fill
              sizes="(min-width: 768px) 384px, 256px"
              priority
            />
          </div>
        </div>
      </section>

      <DrillListContainer
        drills={drills}
        allTags={allTags}
        initialSelectedTags={selectedTags}
        initialPage={currentPage}
        initialSearchText={currentQuery}
      />
    </div>
  );
}
