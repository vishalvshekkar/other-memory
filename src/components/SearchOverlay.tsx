import { useState, useRef, useEffect, useCallback } from "react";
import type { TimelineEvent } from "@/types";
import type { TimelineDataWithMaps } from "@/data/loader";
import { formatAGYear } from "@/utils/calendar";

interface SearchOverlayProps {
  data: TimelineDataWithMaps;
  onSelectEvent: (eventId: string) => void;
  onClose: () => void;
}

export function SearchOverlay({ data, onSelectEvent, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search results
  const results = query.length >= 1 ? searchEvents(data, query) : [];

  // Clamp selected index
  useEffect(() => {
    if (selectedIndex >= results.length) {
      setSelectedIndex(Math.max(0, results.length - 1));
    }
  }, [results.length, selectedIndex]);

  const handleSelect = useCallback(
    (eventId: string) => {
      onSelectEvent(eventId);
      onClose();
    },
    [onSelectEvent, onClose],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex].id);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [results, selectedIndex, handleSelect, onClose],
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-[15vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[560px] bg-[#12121a] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center px-4 border-b border-white/[0.06]">
          <span className="text-[#5a5548] text-sm mr-2">/</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search events, characters, factions..."
            className="flex-1 bg-transparent py-3 text-sm text-[#e8e0d0] placeholder-[#3a3530] outline-none"
          />
          <span className="text-[9px] text-[#3a3530] ml-2">ESC</span>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {results.length === 0 && query.length >= 1 && (
            <div className="px-4 py-6 text-center text-sm text-[#5a5548]">
              No events found for &ldquo;{query}&rdquo;
            </div>
          )}
          {results.map((event, i) => (
            <button
              key={event.id}
              onClick={() => handleSelect(event.id)}
              onMouseEnter={() => setSelectedIndex(i)}
              className="w-full px-4 py-2.5 flex items-start gap-3 text-left transition-colors"
              style={{
                backgroundColor:
                  i === selectedIndex ? "rgba(196, 132, 29, 0.08)" : "transparent",
              }}
            >
              {/* Category color dot */}
              <span
                className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                style={{
                  backgroundColor: `var(--color-cat-${event.category})`,
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#e8e0d0] truncate">
                    {event.title}
                  </span>
                  <span className="text-[10px] text-[#5a5548] shrink-0">
                    {formatAGYear(event.date_start)}
                  </span>
                </div>
                <p className="text-[11px] text-[#5a5548] truncate mt-0.5">
                  {event.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-white/[0.04] text-[9px] text-[#3a3530] flex gap-4">
            <span>↑↓ Navigate</span>
            <span>Enter Select</span>
            <span>Esc Close</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Simple substring search across event fields */
function searchEvents(
  data: TimelineDataWithMaps,
  query: string,
): TimelineEvent[] {
  const q = query.toLowerCase();
  const allEvents = [...data.events, ...data.eras];

  return allEvents
    .filter((e) => {
      const searchable = [
        e.title,
        e.description,
        e.subtitle ?? "",
        ...e.tags,
        ...e.characters,
        ...e.factions,
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    })
    .sort((a, b) => b.significance - a.significance)
    .slice(0, 20);
}
