import { useState, useCallback, useEffect, useMemo } from "react";
import { TimelineDataProvider, useTimelineData } from "@/data/TimelineDataContext";
import { TimelineCanvas } from "@/components/TimelineCanvas";
import { Tooltip } from "@/components/Tooltip";
import { DetailPanel } from "@/components/DetailPanel";
import { FilterPanel } from "@/components/FilterPanel";
import { BookSelector } from "@/components/BookSelector";
import { SearchOverlay } from "@/components/SearchOverlay";
import { ShortcutOverlay } from "@/components/ShortcutOverlay";
import { useCamera } from "@/hooks/useCamera";
import { useFilters } from "@/hooks/useFilters";
import { handleKeyDown } from "@/timeline/interaction/keyboard";
import { filterEvents, getContextualEventIds } from "@/timeline/filter";
import { useURLSync } from "@/hooks/useURLSync";
import { formatAGYear } from "@/utils/calendar";
import { getTierPixelsPerYear } from "@/timeline/zoom";

type PanelId = "filter" | "book" | "search" | "shortcuts" | null;

function TimelineApp() {
  const data = useTimelineData();
  const [viewportSize, setViewportSize] = useState({ width: 1200, height: 600 });
  const { camera, dispatch: cameraDispatch, zoomTier, zoomTierConfig, bounds, fitAll, centerOn } =
    useCamera(viewportSize.width);
  const { filters, dispatch: filterDispatch, hasActiveFilters } = useFilters();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const [showCE, setShowCE] = useState(false);

  // ─── URL Sync ───

  useURLSync(
    { center: camera.center, zoomTier, selectedEventId },
    {
      onCenterChange: centerOn,
      onZoomTierChange: (tier) => {
        cameraDispatch({
          type: "SET",
          camera: { ...camera, pixels_per_year: getTierPixelsPerYear(tier) },
        });
      },
      onSelectEvent: setSelectedEventId,
    },
  );

  // ─── Filtering ───

  const filteredEvents = useMemo(
    () => filterEvents(data.events, filters, data.books),
    [data.events, data.books, filters],
  );

  const contextualEventIds = useMemo(
    () => getContextualEventIds(filteredEvents),
    [filteredEvents],
  );

  // Resolve hovered/selected events
  const hoveredEvent = hoveredEventId ? data.eventsById.get(hoveredEventId) ?? null : null;
  const selectedEvent = selectedEventId ? data.eventsById.get(selectedEventId) ?? null : null;

  // ─── Camera ───

  const handleCameraChange = useCallback(
    (newCamera: { center: number; pixels_per_year: number }) => {
      cameraDispatch({ type: "SET", camera: newCamera });
    },
    [cameraDispatch],
  );

  const handleViewportResize = useCallback((width: number, height: number) => {
    setViewportSize({ width, height });
  }, []);

  // ─── Panel toggling ───

  const togglePanel = useCallback((panel: PanelId) => {
    setActivePanel((current) => (current === panel ? null : panel));
  }, []);

  // ─── Keyboard ───

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const action = handleKeyDown(e);
      if (!action) return;

      switch (action.type) {
        case "PAN_LEFT":
          cameraDispatch({ type: "PAN", deltaPixels: -100 });
          break;
        case "PAN_RIGHT":
          cameraDispatch({ type: "PAN", deltaPixels: 100 });
          break;
        case "ZOOM_IN":
          cameraDispatch({ type: "ZOOM_IN", viewportWidth: viewportSize.width });
          break;
        case "ZOOM_OUT":
          cameraDispatch({ type: "ZOOM_OUT", viewportWidth: viewportSize.width });
          break;
        case "FIT_ALL":
          fitAll();
          break;
        case "JUMP_TO_TIER":
          cameraDispatch({
            type: "JUMP_TO_TIER",
            tier: action.tier,
            viewportWidth: viewportSize.width,
          });
          break;
        case "TOGGLE_DETAIL":
          if (selectedEventId) setSelectedEventId(null);
          break;
        case "CLOSE_PANEL":
          if (activePanel) setActivePanel(null);
          else setSelectedEventId(null);
          break;
        case "OPEN_SEARCH":
          togglePanel("search");
          break;
        case "OPEN_FILTERS":
          togglePanel("filter");
          break;
        case "OPEN_BOOKS":
          togglePanel("book");
          break;
        case "SHOW_SHORTCUTS":
          togglePanel("shortcuts");
          break;
        case "GO_HOME":
          centerOn(bounds.min);
          break;
        case "GO_END":
          centerOn(bounds.max);
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [cameraDispatch, viewportSize.width, fitAll, centerOn, bounds, selectedEventId, activePanel, togglePanel]);

  // ─── Event Navigation ───

  const handleNavigateToEvent = useCallback(
    (eventId: string) => {
      const event = data.eventsById.get(eventId);
      if (event) {
        setSelectedEventId(eventId);
        centerOn(event.date_start);
      }
    },
    [data.eventsById, centerOn],
  );

  const handleSearchSelect = useCallback(
    (eventId: string) => {
      handleNavigateToEvent(eventId);
      setActivePanel(null);
    },
    [handleNavigateToEvent],
  );

  // ─── Render ───

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <header className="h-11 flex items-center px-4 border-b border-white/[0.08] shrink-0 gap-2">
        <h1 className="font-['Cinzel'] text-[11px] tracking-[0.2em] text-[#8a8070] uppercase">
          Dune Timeline
        </h1>

        <div className="ml-auto flex items-center gap-1">
          {/* Panel toggles */}
          <button
            onClick={() => togglePanel("search")}
            className={`px-2 h-7 flex items-center text-[10px] rounded transition-colors ${activePanel === "search" ? "bg-white/[0.06] text-[#c4841d]" : "text-[#5a5548] hover:text-[#8a8070] hover:bg-white/[0.03]"}`}
            title="Search (/)">
            /
          </button>
          <button
            onClick={() => togglePanel("filter")}
            className={`px-2 h-7 flex items-center text-[10px] rounded transition-colors ${activePanel === "filter" ? "bg-white/[0.06] text-[#c4841d]" : "text-[#5a5548] hover:text-[#8a8070] hover:bg-white/[0.03]"} ${hasActiveFilters ? "text-[#c4841d]" : ""}`}
            title="Filters (F)">
            Filters{hasActiveFilters ? " \u2022" : ""}
          </button>
          <button
            onClick={() => togglePanel("book")}
            className={`px-2 h-7 flex items-center text-[10px] rounded transition-colors ${activePanel === "book" ? "bg-white/[0.06] text-[#c4841d]" : "text-[#5a5548] hover:text-[#8a8070] hover:bg-white/[0.03]"}`}
            title="Books (B)">
            Books
          </button>
          <button
            onClick={() => setShowCE((v) => !v)}
            className={`px-2 h-7 flex items-center text-[10px] rounded transition-colors ${showCE ? "bg-[#1a6b8a]/20 text-[#1a6b8a]" : "text-[#5a5548] hover:text-[#8a8070] hover:bg-white/[0.03]"}`}
            title="Toggle real-world CE calendar axis">
            CE
          </button>

          <span className="w-px h-4 bg-white/[0.06] mx-1" />

          {/* Zoom controls */}
          <button
            onClick={() => cameraDispatch({ type: "ZOOM_OUT", viewportWidth: viewportSize.width })}
            className="w-7 h-7 flex items-center justify-center text-[#5a5548] hover:text-[#e8e0d0] transition-colors text-sm rounded hover:bg-white/[0.04]"
            aria-label="Zoom out">
            &minus;
          </button>
          <span className="text-[10px] text-[#5a5548] min-w-[65px] text-center">
            {zoomTierConfig.label}
          </span>
          <button
            onClick={() => cameraDispatch({ type: "ZOOM_IN", viewportWidth: viewportSize.width })}
            className="w-7 h-7 flex items-center justify-center text-[#5a5548] hover:text-[#e8e0d0] transition-colors text-sm rounded hover:bg-white/[0.04]"
            aria-label="Zoom in">
            +
          </button>
          <button
            onClick={fitAll}
            className="w-7 h-7 flex items-center justify-center text-[#5a5548] hover:text-[#e8e0d0] transition-colors text-[10px] rounded hover:bg-white/[0.04]"
            aria-label="Fit all" title="Fit entire timeline (0)">
            [ ]
          </button>

          <span className="w-px h-4 bg-white/[0.06] mx-1" />

          <button
            onClick={() => togglePanel("shortcuts")}
            className="w-7 h-7 flex items-center justify-center text-[#3a3530] hover:text-[#8a8070] transition-colors text-sm rounded hover:bg-white/[0.04]"
            title="Keyboard shortcuts (?)">
            ?
          </button>
        </div>
      </header>

      {/* Timeline Canvas */}
      <TimelineCanvas
        camera={camera}
        onCameraChange={handleCameraChange}
        selectedEventId={selectedEventId}
        onSelectEvent={setSelectedEventId}
        hoveredEventId={hoveredEventId}
        onHoverEvent={setHoveredEventId}
        onHoverPosition={setHoverPosition}
        onViewportResize={handleViewportResize}
        contextualEventIds={contextualEventIds}
        showCEAxis={showCE}
        agZeroCEYear={data.config.ag_zero_ce_year}
      />

      {/* Footer */}
      <footer className="h-6 flex items-center px-4 border-t border-white/[0.08] shrink-0 text-[9px] text-[#3a3530] gap-3">
        <span>{formatAGYear(Math.round(camera.center))}</span>
        <span>Tier {zoomTier}: {zoomTierConfig.label}</span>
        <span>{camera.pixels_per_year.toFixed(2)} px/yr</span>
        <span className="ml-auto">
          {filteredEvents.length}/{data.events.length} events
        </span>
      </footer>

      {/* Tooltip */}
      <Tooltip event={hoveredEvent} position={hoverPosition} />

      {/* Detail Panel */}
      {selectedEvent && (
        <DetailPanel
          event={selectedEvent}
          data={data}
          onClose={() => setSelectedEventId(null)}
          onNavigate={handleNavigateToEvent}
        />
      )}

      {/* Filter Panel */}
      {activePanel === "filter" && (
        <FilterPanel
          filters={filters}
          data={data}
          onToggleCategory={(cat) =>
            filterDispatch({ type: "TOGGLE_CATEGORY", category: cat })
          }
          onToggleFaction={(f) =>
            filterDispatch({ type: "TOGGLE_FACTION", faction: f })
          }
          onSetSignificance={(min) =>
            filterDispatch({ type: "SET_MIN_SIGNIFICANCE", min })
          }
          onClose={() => setActivePanel(null)}
        />
      )}

      {/* Book Selector */}
      {activePanel === "book" && (
        <BookSelector
          books={data.books}
          filters={filters.books}
          readingMode={filters.reading_mode}
          data={data}
          onCycleBook={(id) =>
            filterDispatch({ type: "CYCLE_BOOK_FILTER", bookId: id })
          }
          onHighlightOnly={(id) =>
            filterDispatch({ type: "HIGHLIGHT_ONLY_BOOK", bookId: id })
          }
          onResetBooks={() => filterDispatch({ type: "RESET_BOOK_FILTERS" })}
          onSetReadingMode={(enabled, bookId) =>
            filterDispatch({ type: "SET_READING_MODE", enabled, bookId })
          }
          onClose={() => setActivePanel(null)}
        />
      )}

      {/* Search Overlay */}
      {activePanel === "search" && (
        <SearchOverlay
          data={data}
          onSelectEvent={handleSearchSelect}
          onClose={() => setActivePanel(null)}
        />
      )}

      {/* Shortcut Overlay */}
      {activePanel === "shortcuts" && (
        <ShortcutOverlay onClose={() => setActivePanel(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <TimelineDataProvider>
      <TimelineApp />
    </TimelineDataProvider>
  );
}
