import Link from "next/link";
import { Apple } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-10 h-10 bg-rose-100 rounded-full group-hover:bg-rose-200 transition-colors duration-300">
            <Apple
              className="w-6 h-6 text-rose-600 group-hover:scale-110 transition-transform duration-300"
              fill="currentColor"
            />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-wide group-hover:text-rose-600 transition-colors duration-300 font-sans">
            ふるーつドリル
          </span>
        </Link>
        {/* Navigation items could go here */}
      </div>
    </header>
  );
};
