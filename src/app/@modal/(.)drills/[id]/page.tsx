import { getDrill } from "@/features/drills/api/getDrills";
import { DrillDetail } from "@/features/drills/components/DrillDetail";
import { Modal } from "@/components/ui/Modal";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function DrillModalPage({ params }: Props) {
    const { id } = await params;
    const drill = await getDrill(id);

    if (!drill) {
        notFound();
    }

    return (
        <Modal>
            <DrillDetail drill={drill} />
        </Modal>
    );
}
