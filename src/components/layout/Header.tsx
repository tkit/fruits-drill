import Link from "next/link";
import { Apple } from "lucide-react";

export const Header = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-amber-100 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-rose-100 p-2 rounded-xl group-hover:bg-rose-200 transition-colors">
                        <Apple className="w-6 h-6 text-rose-600" fill="currentColor" />
                    </div>
                    <span className="text-xl font-bold text-gray-800 tracking-wide group-hover:text-rose-600 transition-colors">
                        ふるーつドリル
                    </span>
                </Link>
                {/* Navigation items could go here */}
            </div>
        </header>
    );
};
