import { getDrill, getDrills } from "@/features/drills/api/getDrills";
import { DrillDetail } from "@/features/drills/components/DrillDetail";
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
            <DrillDetail drill={drill} />
        </div>
    );
}
