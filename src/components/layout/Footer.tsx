export const Footer = () => {
  return (
    <footer className="w-full border-t border-amber-100 bg-amber-50 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4">
          <a href="/about" className="text-sm text-slate-500 hover:text-rose-500 transition-colors">
            このサイトについて
          </a>
        </div>
        <p className="text-sm text-gray-500 font-medium">
          © {new Date().getFullYear()} ふるーつドリル All rights reserved.
        </p>
      </div>
    </footer>
  );
};
