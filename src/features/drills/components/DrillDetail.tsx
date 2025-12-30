import Image from "next/image";
import { Download } from "lucide-react";
import { ShareButtons } from "@/components/ui/ShareButtons";
import type { Drill } from "../types";
type Props = {
    drill: Drill;
};

export const DrillDetail = ({ drill }: Props) => {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-lg max-w-2xl mx-auto border-4 border-amber-100">
            <div className="relative aspect-[4/3] w-full bg-amber-50">
                <Image
                    src={drill.thumbnail.url}
                    alt={drill.title}
                    fill
                    className="object-contain p-4"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                />
            </div>

            <div className="p-6 md:p-8 flex flex-col items-center text-center space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                        {drill.title}
                    </h1>
                    {drill.description && (
                        <p className="text-gray-600 leading-relaxed">
                            {drill.description}
                        </p>
                    )}
                </div>

                {drill.tags && (
                    <div className="flex flex-wrap gap-2 justify-center">
                        {drill.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="w-full max-w-sm">
                    <a
                        href={drill.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300"
                    >
                        <Download className="w-6 h-6" />
                        ダウンロードする
                    </a>
                    <p className="mt-2 text-xs text-gray-400">
                        PDFファイルが開きます
                    </p>
                </div>

                <div className="pt-4 border-t border-gray-100 w-full">
                    <ShareButtons
                        title={`${drill.title} | ふるーつドリル`}
                        url={typeof window !== "undefined" ? window.location.href : ""}
                    />
                </div>
            </div>
        </div>
    );
};
