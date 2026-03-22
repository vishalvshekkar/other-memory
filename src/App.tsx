import { useState, useCallback, useEffect, useMemo } from "react";
import { TimelineDataProvider, useTimelineData } from "@/data/TimelineDataContext";
import { TimelineCanvas } from "@/components/TimelineCanvas";
import { Tooltip } from "@/components/Tooltip";
import { DetailPanel } from "@/components/DetailPanel";
import { FilterPanel } from "@/components/FilterPanel";
import { BookSelector } from "@/components/BookSelector";
import { SearchOverlay } from "@/components/SearchOverlay";
import { ShortcutOverlay } from "@/components/ShortcutOverlay";
import { HelpGuide } from "@/components/HelpGuide";
import { useCamera } from "@/hooks/useCamera";
import { useFilters } from "@/hooks/useFilters";
import { handleKeyDown } from "@/timeline/interaction/keyboard";
import { filterEvents, getContextualEventIds } from "@/timeline/filter";
import { useURLSync } from "@/hooks/useURLSync";
import { formatAGYear } from "@/utils/calendar";
import { getTierPixelsPerYear } from "@/timeline/zoom";

type PanelId = "filter" | "book" | "search" | "shortcuts" | "guide" | null;

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
  const [showMedia, setShowMedia] = useState(true);

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

  /** Zoom to an event at a level where it and its neighbors are individually visible */
  const handleZoomToEvent = useCallback(
    (eventId: string) => {
      const event = data.eventsById.get(eventId);
      if (!event) return;

      // Find nearby events to determine a good zoom level
      const eventYear = event.date_start;
      const nearby = data.events.filter(
        (e) => e.id !== eventId && Math.abs(e.date_start - eventYear) < 500,
      );

      // Calculate a zoom level where the nearest neighbor is at least 60px away
      let targetPPY: number;
      if (nearby.length === 0) {
        // No neighbors — zoom to tier 5 (years level)
        targetPPY = getTierPixelsPerYear(5);
      } else {
        // Find the closest neighbor
        const minGap = Math.min(
          ...nearby.map((e) => Math.max(1, Math.abs(e.date_start - eventYear))),
        );
        // We want at least 60px between this event and its closest neighbor
        targetPPY = Math.min(60 / minGap, getTierPixelsPerYear(5));
        targetPPY = Math.max(targetPPY, getTierPixelsPerYear(3)); // at least tier 3
      }

      cameraDispatch({
        type: "SET",
        camera: { center: eventYear, pixels_per_year: targetPPY },
      });
    },
    [data.eventsById, data.events, cameraDispatch],
  );

  // ─── Render ───

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <header className="h-11 flex items-center px-4 border-b border-white/[0.08] shrink-0 gap-2">
        <h1 className="font-['Cinzel'] text-[11px] tracking-[0.2em] text-[#8a8070] uppercase">
          Other Memory
        </h1>
        <span className="text-[9px] text-[#3a3530] hidden sm:inline">The Complete Dune Timeline</span>

        <div className="ml-auto flex items-center gap-1">
          {/* GitHub link */}
          <a
            href="https://github.com/vishalvshekkar/other-memory"
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 flex items-center justify-center text-[#3a3530] hover:text-[#8a8070] transition-colors rounded hover:bg-white/[0.03]"
            title="View on GitHub — contribute events, report issues"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
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
          <button
            onClick={() => setShowMedia((v) => !v)}
            className={`px-2 h-7 flex items-center text-[10px] rounded transition-colors ${showMedia ? "bg-[#7b4db5]/20 text-[#7b4db5]" : "text-[#5a5548] hover:text-[#8a8070] hover:bg-white/[0.03]"}`}
            title="Toggle movies & TV shows on timeline">
            Media
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
            onClick={() => togglePanel("guide")}
            className={`px-2 h-7 flex items-center text-[10px] rounded transition-colors ${activePanel === "guide" ? "bg-white/[0.06] text-[#c4841d]" : "text-[#3a3530] hover:text-[#8a8070] hover:bg-white/[0.03]"}`}
            title="Open user guide">
            Guide
          </button>
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
        ceAnchorExpanded={data.config.ce_anchor_expanded}
        ceAnchorEncyclopedia={data.config.ce_anchor_encyclopedia}
        showMediaBands={showMedia}
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
          onZoomToEvent={handleZoomToEvent}
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

      {/* Help Guide */}
      {activePanel === "guide" && (
        <HelpGuide onClose={() => setActivePanel(null)} />
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
