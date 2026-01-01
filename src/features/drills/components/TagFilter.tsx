import Link from "next/link";
import { cn } from "@/lib/utils";
import { getFruitTheme } from "@/features/drills/utils/filterDrills";

type Props = {
  allTags: string[];
  selectedTags: string[];
  disabledTags: string[];
  onToggle?: (tag: string) => void;
  onClear?: () => void;
};

// Map soft background colors to solid active colors
const ACTIVE_COLOR_MAP: Record<string, string> = {
  "bg-rose-100": "bg-rose-500 border-rose-600 hover:bg-rose-600",
  "bg-orange-100": "bg-orange-500 border-orange-600 hover:bg-orange-600",
  "bg-purple-100": "bg-purple-500 border-purple-600 hover:bg-purple-600",
  "bg-green-100": "bg-green-500 border-green-600 hover:bg-green-600",
  "bg-yellow-100": "bg-yellow-500 border-yellow-600 hover:bg-yellow-600",
  "bg-amber-100": "bg-amber-500 border-amber-600 hover:bg-amber-600",
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

  const baseButtonClass =
    "rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 border transform active:scale-95";
  const defaultActive =
    "bg-rose-500 text-white shadow-md border-rose-600 hover:bg-rose-600 hover:-translate-y-0.5";
  const inactiveClass =
    "bg-white text-gray-600 border-border/60 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 hover:shadow-sm hover:-translate-y-0.5";
  const disabledClass = "bg-gray-100 text-gray-300 border-transparent cursor-not-allowed";

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {/* "All" button clears everything */}
      {onToggle ? (
        <button
          onClick={() => onClear?.()}
          type="button"
          className={cn(baseButtonClass, selectedTags.length === 0 ? defaultActive : inactiveClass)}
        >
          すべて
        </button>
      ) : (
        <Link
          href="/"
          className={cn(
            baseButtonClass,
            selectedTags.length === 0 ? defaultActive : inactiveClass,
            "inline-block"
          )}
        >
          すべて
        </Link>
      )}

      {allTags.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        const isDisabled = !isSelected && disabledTags.includes(tag);

        // Dynamic styling
        const theme = getFruitTheme(tag);
        const activeColorClass = ACTIVE_COLOR_MAP[theme.bgColor] || defaultActive;
        const dynamicActiveClass = cn(
          "text-white shadow-md hover:-translate-y-0.5",
          activeColorClass
        );

        if (isDisabled) {
          return (
            <span key={tag} className={cn(baseButtonClass, disabledClass)}>
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
              className={cn(baseButtonClass, isSelected ? dynamicActiveClass : inactiveClass)}
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
              baseButtonClass,
              isSelected ? dynamicActiveClass : inactiveClass,
              "inline-block"
            )}
          >
            {tag}
          </Link>
        );
      })}
    </div>
  );
};
