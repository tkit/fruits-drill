import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
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

      <div className="space-y-10">
        {/* Search Input Skeleton */}
        <section className="max-w-md mx-auto relative group">
          <Skeleton className="h-12 w-full rounded-full" />
        </section>

        {/* Tag Filter Skeleton */}
        <section className="flex justify-center gap-2 flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </section>

        {/* Drill Grid Skeleton */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="group block overflow-hidden rounded-3xl bg-white shadow-sm border border-orange-100"
              >
                <div className="aspect-square w-full overflow-hidden bg-amber-50 relative">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex gap-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
