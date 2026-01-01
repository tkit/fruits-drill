"use client";

import { useState, useMemo, useEffect, useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Drill } from "@/features/drills/types";
import { DrillCard } from "@/features/drills/components/DrillCard";
import { TagFilter } from "@/features/drills/components/TagFilter";
import { filterDrills, calculateDisabledTags } from "@/features/drills/utils/filterDrills";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  drills: Drill[];
  allTags: string[];
  initialSelectedTags: string[];
  initialPage: number;
  initialSearchText: string;
};

const ITEMS_PER_PAGE = 24;

export const DrillListContainer = ({
  drills,
  allTags,
  initialSelectedTags,
  initialPage,
  initialSearchText,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // useTransition for non-blocking UI updates
  const [isPending, startTransition] = useTransition();

  // Local state for immediate UI feedback (Input & Checkboxes)
  const [searchText, setSearchText] = useState(initialSearchText);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);

  // Deferred state for heavy filtering logic
  const [deferredSearchText, setDeferredSearchText] = useState(initialSearchText);
  const [deferredSelectedTags, setDeferredSelectedTags] = useState<string[]>(initialSelectedTags);

  // Sync local state with props (e.g. on browser back/forward navigation)
  useEffect(() => {
    setSearchText(initialSearchText);
    setDeferredSearchText(initialSearchText);
  }, [initialSearchText]);

  useEffect(() => {
    setSelectedTags(initialSelectedTags);
    setDeferredSelectedTags(initialSelectedTags);
  }, [initialSelectedTags]);

  // Update URL function
  const updateUrl = useCallback(
    (newParams: URLSearchParams) => {
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    },
    [router, pathname]
  );

  // Debounced search URL update
  useEffect(() => {
    // Skip if search text matches global state (initial render or synced)
    if (searchText === initialSearchText) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchText) {
        params.set("q", searchText);
      } else {
        params.delete("q");
      }
      // Reset to page 1 on search change
      params.delete("page");
      updateUrl(params);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText, initialSearchText, searchParams, updateUrl]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    startTransition(() => {
      setDeferredSearchText(value);
    });
  };

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags); // Immediate UI update

    startTransition(() => {
      setDeferredSelectedTags(newTags); // Deferred filter update
    });

    // Update URL
    const params = new URLSearchParams(searchParams);
    if (newTags.length > 0) {
      params.set("tags", newTags.join(","));
    } else {
      params.delete("tags");
    }
    // Reset to page 1 on filter change
    params.delete("page");
    updateUrl(params);
  };

  const handleClearTags = () => {
    setSelectedTags([]);
    startTransition(() => {
      setDeferredSelectedTags([]);
    });

    const params = new URLSearchParams(searchParams);
    params.delete("tags");
    params.delete("page");
    updateUrl(params);
  };

  const handleClearSearch = () => {
    setSearchText("");
    startTransition(() => {
      setDeferredSearchText("");
    });
    // URL update will happen via useEffect
  };

  // Filter drills by search text AND selected tags
  // Uses DEFERRED state to keep UI responsive
  const filteredDrills = useMemo(() => {
    // 1. Tag filtering
    let result = filterDrills(drills, deferredSelectedTags);

    // 2. Text filtering
    if (deferredSearchText.trim()) {
      const lowerQuery = deferredSearchText.toLowerCase().trim();
      result = result.filter((drill) => {
        // Search in title
        if (drill.title.toLowerCase().includes(lowerQuery)) return true;
        // Search in tags
        if (drill.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))) return true;
        return false;
      });
    }

    return result;
  }, [drills, deferredSelectedTags, deferredSearchText]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredDrills.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(Math.max(1, initialPage), totalPages || 1);
  const paginatedDrills = filteredDrills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate disabled tags using DEFERRED state
  const disabledTags = useMemo(() => {
    let baseDrills = drills;
    if (deferredSearchText.trim()) {
      const lowerQuery = deferredSearchText.toLowerCase().trim();
      baseDrills = drills.filter((drill) => {
        if (drill.title.toLowerCase().includes(lowerQuery)) return true;
        if (drill.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))) return true;
        return false;
      });
    }
    return calculateDisabledTags(baseDrills, deferredSelectedTags, allTags);
  }, [drills, deferredSelectedTags, allTags, deferredSearchText]);

  // Helper to create pagination links
  const createPageUrl = (pageInfo: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageInfo.toString());
    return `${pathname}?${params.toString()}`;
  };

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
          onChange={handleSearchChange}
        />
        {searchText && (
          <button
            onClick={handleClearSearch}
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
          onToggle={handleTagToggle}
          onClear={handleClearTags}
        />
      </section>

      {/* Drill Grid */}
      <section>
        {filteredDrills.length > 0 ? (
          <>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12 transition-opacity duration-200 ${
                isPending ? "opacity-50" : "opacity-100"
              }`}
            >
              {paginatedDrills.map((drill, index) => (
                <DrillCard key={drill.id} drill={drill} priority={index < 4} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={createPageUrl(currentPage - 1)}
                      aria-disabled={currentPage <= 1}
                      tabIndex={currentPage <= 1 ? -1 : undefined}
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {/* Simple pagination logic for now: show all or simple range */}
                  {/* For many pages, we might need robust logic (1, 2, ..., current, ..., last) */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first, last, current, and neighbors
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href={createPageUrl(page)}
                            isActive={page === currentPage}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (
                      (page === currentPage - 2 && page > 2) ||
                      (page === currentPage + 2 && page < totalPages - 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href={createPageUrl(currentPage + 1)}
                      aria-disabled={currentPage >= totalPages}
                      tabIndex={currentPage >= totalPages ? -1 : undefined}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500 space-y-2">
            <p>条件に一致するドリルは見つかりませんでした。</p>
            {(searchText || selectedTags.length > 0) && (
              <button
                onClick={() => {
                  handleClearSearch();
                  handleClearTags();
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
