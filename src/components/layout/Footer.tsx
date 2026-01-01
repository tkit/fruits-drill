import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="w-full mt-auto">
      <div className="bg-amber-100/30 pt-12 pb-12 relative border-t border-amber-200/50">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 flex justify-center space-x-6">
            <Link
              href="/about"
              className="text-sm font-medium text-amber-800/70 hover:text-rose-600 transition-colors"
            >
              このサイトについて
            </Link>
            {/* Add more links here if needed */}
          </div>
          <p className="text-sm text-amber-900/40 font-medium">
            © {new Date().getFullYear()} ふるーつドリル All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
