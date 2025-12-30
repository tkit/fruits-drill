import type { Drill } from "../types";

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
