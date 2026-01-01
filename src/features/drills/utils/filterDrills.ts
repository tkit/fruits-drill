import type { Drill } from "../types";

// Define theme types
export type FruitTheme = {
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: "apple" | "citrus" | "grape" | "leaf" | "book";
};

// Subject mapping
const FRUIT_THEME_MAPPING: Record<string, FruitTheme> = {
  算数: {
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-200",
    iconName: "citrus",
  },
  国語: {
    color: "text-rose-700",
    bgColor: "bg-rose-100",
    borderColor: "border-rose-200",
    iconName: "apple",
  },
  英語: {
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
    iconName: "grape",
  },
  理科: {
    color: "text-green-700",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    iconName: "leaf",
  },
  社会: {
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
    iconName: "book",
  },
};

const DEFAULT_THEME: FruitTheme = {
  color: "text-amber-800",
  bgColor: "bg-amber-100",
  borderColor: "border-amber-200",
  iconName: "book",
};

/**
 * Get fruit theme based on tag name
 */
export const getFruitTheme = (tagName: string): FruitTheme => {
  // Simple partial match for flexibility (e.g. "小1算数" matches "算数")
  const key = Object.keys(FRUIT_THEME_MAPPING).find((k) => tagName.includes(k));
  return key ? FRUIT_THEME_MAPPING[key] : DEFAULT_THEME;
};

/**
 * Filter drills based on selected tags (AND condition)
 */
export const filterDrills = (drills: Drill[], selectedTags: string[]): Drill[] => {
  if (selectedTags.length === 0) return drills;

  return drills.filter((drill) => {
    return selectedTags.every((selectedTag) => drill.tags?.includes(selectedTag));
  });
};

/**
 * Calculate tags that should be disabled to prevent 0-hit results
 */
export const calculateDisabledTags = (
  drills: Drill[],
  selectedTags: string[],
  allTags: string[]
): string[] => {
  return allTags.filter((tag) => {
    // If already selected, not disabled (can be removed)
    if (selectedTags.includes(tag)) return false;

    // Hypothetically select this tag
    const nextSelectedTags = [...selectedTags, tag];

    // Check if any drill matches ALL new conditions
    const hasMatch = drills.some((drill) => {
      return nextSelectedTags.every((t) => drill.tags?.includes(t));
    });

    return !hasMatch;
  });
};

/**
 * Extract distinct tags from drills
 */
export const getAllTags = (drills: Drill[]): string[] => {
  return Array.from(new Set(drills.flatMap((drill) => drill.tags || []))).sort();
};
