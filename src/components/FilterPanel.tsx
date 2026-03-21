import type { FilterState, CategoryId } from "@/types";
import type { TimelineDataWithMaps } from "@/data/loader";

interface FilterPanelProps {
  filters: FilterState;
  data: TimelineDataWithMaps;
  onToggleCategory: (category: CategoryId) => void;
  onToggleFaction: (faction: string) => void;
  onSetSignificance: (min: 1 | 2 | 3 | 4 | 5) => void;
  onClose: () => void;
}

const SIG_LABELS: Record<number, string> = {
  1: "All events",
  2: "Notable+",
  3: "Significant+",
  4: "Major+",
  5: "Universe-altering only",
};

export function FilterPanel({
  filters,
  data,
  onToggleCategory,
  onToggleFaction,
  onSetSignificance,
  onClose,
}: FilterPanelProps) {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-[300px] bg-[#12121a] border-r border-white/[0.08] z-40 overflow-y-auto transition-transform duration-300">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-[#5a5548] hover:text-[#e8e0d0] transition-colors text-lg w-8 h-8 flex items-center justify-center"
        aria-label="Close filter panel"
      >
        &times;
      </button>

      <div className="p-5 pt-12">
        <h2 className="text-xs uppercase tracking-widest text-[#5a5548] mb-4">
          Filters
        </h2>

        {/* Categories */}
        <section className="mb-6">
          <h3 className="text-[10px] uppercase tracking-widest text-[#3a3530] mb-2">
            Categories
          </h3>
          <div className="space-y-1">
            {data.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onToggleCategory(cat.id)}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-left text-sm transition-colors hover:bg-white/[0.03]"
              >
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{
                    backgroundColor: filters.categories[cat.id]
                      ? cat.color
                      : "transparent",
                    border: `1px solid ${cat.color}`,
                    opacity: filters.categories[cat.id] ? 1 : 0.3,
                  }}
                />
                <span
                  className="text-[#c0b8a8]"
                  style={{ opacity: filters.categories[cat.id] ? 1 : 0.4 }}
                >
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Significance */}
        <section className="mb-6">
          <h3 className="text-[10px] uppercase tracking-widest text-[#3a3530] mb-2">
            Minimum Significance
          </h3>
          <input
            type="range"
            min="1"
            max="5"
            value={filters.min_significance}
            onChange={(e) =>
              onSetSignificance(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)
            }
            className="w-full accent-[#c4841d]"
          />
          <div className="text-xs text-[#8a8070] mt-1">
            {SIG_LABELS[filters.min_significance]}
          </div>
        </section>

        {/* Factions */}
        <section className="mb-6">
          <h3 className="text-[10px] uppercase tracking-widest text-[#3a3530] mb-2">
            Factions
          </h3>
          <div className="space-y-1">
            {data.factions.map((faction) => {
              const isActive = filters.factions.includes(faction.id);
              return (
                <button
                  key={faction.id}
                  onClick={() => onToggleFaction(faction.id)}
                  className="flex items-center gap-2 w-full px-2 py-1 rounded text-left text-sm transition-colors hover:bg-white/[0.03]"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: isActive ? faction.color : "transparent",
                      border: `1px solid ${faction.color}`,
                      opacity: isActive ? 1 : 0.3,
                    }}
                  />
                  <span
                    className="text-[#c0b8a8] text-xs"
                    style={{ opacity: isActive || filters.factions.length === 0 ? 1 : 0.4 }}
                  >
                    {faction.name}
                  </span>
                </button>
              );
            })}
          </div>
          {filters.factions.length > 0 && (
            <button
              onClick={() => {
                // Clear all factions - dispatch handled by parent
                for (const f of filters.factions) {
                  onToggleFaction(f);
                }
              }}
              className="text-[10px] text-[#c4841d] mt-2 hover:underline"
            >
              Clear faction filters
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
