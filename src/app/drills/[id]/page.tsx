import { getDrill, getDrills } from "@/features/drills/api/getDrills";
import { DrillDetail } from "@/features/drills/components/DrillDetail";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ id: string }>;
};

// Generate static params for static export if needed, or better performance
export async function generateStaticParams() {
    const drills = await getDrills();
    return drills.map((drill) => ({
        id: drill.id,
    }));
}

export default async function DrillPage({ params }: Props) {
    const { id } = await params;
    const drill = await getDrill(id);

    if (!drill) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Link
                href="/"
                className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium mb-6 transition-colors"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                トップページに戻る
            </Link>
            <DrillDetail drill={drill} />
        </div>
    );
}
