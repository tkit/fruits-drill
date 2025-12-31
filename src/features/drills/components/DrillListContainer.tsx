"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Drill } from "@/features/drills/types";
import { DrillCard } from "@/features/drills/components/DrillCard";
import { TagFilter } from "@/features/drills/components/TagFilter";
import { filterDrills, calculateDisabledTags } from "@/features/drills/utils/filterDrills";

type Props = {
  drills: Drill[];
  allTags: string[];
  initialSelectedTags: string[];
};

export const DrillListContainer = ({ drills, allTags, initialSelectedTags }: Props) => {
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);

  // Filter drills by search text AND selected tags
  const filteredDrills = useMemo(() => {
    // 1. Tag filtering
    let result = filterDrills(drills, selectedTags);

    // 2. Text filtering
    if (searchText.trim()) {
      const lowerQuery = searchText.toLowerCase().trim();
      result = result.filter((drill) => {
        // Search in title
        if (drill.title.toLowerCase().includes(lowerQuery)) return true;
        // Search in tags
        if (drill.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))) return true;
        return false;
      });
    }

    return result;
  }, [drills, selectedTags, searchText]);

  // Calculate disabled tags based on current selection (and search text?)
  // Ideally, disabled tags should reflect what's available given the *search text* too.
  // But `calculateDisabledTags` utility currently only takes `drills`.
  // If we pass `drills` filtered by search text to `calculateDisabledTags`,
  // then tags effectively narrow down based on search.
  // Let's try that for better UX.
  const disabledTags = useMemo(() => {
    // We want to disable tags that would result in 0 hits.
    // If we use the original 'drills', it checks against all drills.
    // If we use 'drills filtered by search text', it checks against accessible drills.
    // The "AND" logic in `calculateDisabledTags` normally takes the "base set" of drills.
    // Let's filter drills by search text first, then calculate disabled tags for that subset.

    let baseDrills = drills;
    if (searchText.trim()) {
      const lowerQuery = searchText.toLowerCase().trim();
      baseDrills = drills.filter((drill) => {
        if (drill.title.toLowerCase().includes(lowerQuery)) return true;
        if (drill.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))) return true;
        return false;
      });
    }

    return calculateDisabledTags(baseDrills, selectedTags, allTags);
  }, [drills, selectedTags, allTags, searchText]);

  return (
    <div className="space-y-10">
      {/* Search Input */}
      <section className="max-w-md mx-auto relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-rose-500 transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-10 py-3 rounded-full border-2 border-gray-200 focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-100 transition-all text-gray-700 placeholder-gray-400"
          placeholder="キーワードでドリルを探す..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {searchText && (
          <button
            onClick={() => setSearchText("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="検索ワードを消去"
          >
            <X size={18} />
          </button>
        )}
      </section>

      {/* Tag Filter */}
      <section className="flex justify-center">
        <TagFilter
          allTags={allTags}
          selectedTags={selectedTags}
          disabledTags={disabledTags}
          onToggle={(tag) => {
            setSelectedTags((prev) =>
              prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
            );
          }}
          onClear={() => setSelectedTags([])}
        />
      </section>

      {/* Drill Grid */}
      <section>
        {filteredDrills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDrills.map((drill, index) => (
              <DrillCard key={drill.id} drill={drill} priority={index < 4} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 space-y-2">
            <p>条件に一致するドリルは見つかりませんでした。</p>
            {(searchText || selectedTags.length > 0) && (
              <button
                onClick={() => {
                  setSearchText("");
                  setSelectedTags([]);
                }}
                className="text-rose-600 hover:underline text-sm"
              >
                検索条件をリセットする
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
