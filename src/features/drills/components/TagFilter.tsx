import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  allTags: string[];
  selectedTags: string[];
  disabledTags: string[];
  onToggle?: (tag: string) => void;
  onClear?: () => void;
};

export const TagFilter = ({ allTags, selectedTags, disabledTags, onToggle, onClear }: Props) => {
  // Helper to generate href for tag toggling
  const getToggleHref = (tag: string) => {
    const isSelected = selectedTags.includes(tag);
    let newTags: string[];

    if (isSelected) {
      // Remove tag
      newTags = selectedTags.filter((t) => t !== tag);
    } else {
      // Add tag
      newTags = [...selectedTags, tag];
    }

    if (newTags.length === 0) {
      return "/";
    }
    return `/?tags=${encodeURIComponent(newTags.join(","))}`;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* "All" button clears everything */}
      {onToggle ? (
        <button
          onClick={() => onClear?.()}
          type="button"
          className={cn(
            "rounded-full px-4 py-3 text-sm font-bold transition-colors cursor-pointer",
            selectedTags.length === 0
              ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-100"
              : "bg-white text-gray-600 hover:bg-rose-50 border border-gray-200"
          )}
        >
          すべて
        </button>
      ) : (
        <Link
          href="/"
          className={cn(
            "rounded-full px-4 py-3 text-sm font-bold transition-colors",
            selectedTags.length === 0
              ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-100"
              : "bg-white text-gray-600 hover:bg-rose-50 border border-gray-200"
          )}
        >
          すべて
        </Link>
      )}

      {allTags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        const isDisabled = !isSelected && disabledTags.includes(tag);

        if (isDisabled) {
          return (
            <span
              key={tag}
              className="rounded-full px-4 py-2 text-sm font-bold bg-gray-100 text-gray-300 border border-gray-100 cursor-not-allowed"
            >
              {tag}
            </span>
          );
        }

        if (onToggle) {
          return (
            <button
              key={tag}
              onClick={() => onToggle(tag)}
              type="button"
              className={cn(
                "rounded-full px-4 py-3 text-sm font-bold transition-colors cursor-pointer",
                isSelected
                  ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-100"
                  : "bg-white text-gray-600 hover:bg-rose-50 border border-gray-200"
              )}
            >
              {tag}
            </button>
          );
        }

        return (
          <Link
            key={tag}
            href={getToggleHref(tag)}
            className={cn(
              "rounded-full px-4 py-3 text-sm font-bold transition-colors",
              isSelected
                ? "bg-rose-600 text-white shadow-md ring-2 ring-rose-100"
                : "bg-white text-gray-600 hover:bg-rose-50 border border-gray-200"
            )}
          >
            {tag}
          </Link>
        );
      })}
    </div>
  );
};
