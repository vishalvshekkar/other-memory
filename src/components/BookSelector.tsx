import type { Book, BookFilterState } from "@/types";
import type { TimelineDataWithMaps } from "@/data/loader";

interface BookSelectorProps {
  books: Book[];
  filters: Record<string, BookFilterState>;
  readingMode: { enabled: boolean; current_book?: string };
  data: TimelineDataWithMaps;
  onCycleBook: (bookId: string) => void;
  onHighlightOnly: (bookId: string) => void;
  onResetBooks: () => void;
  onSetReadingMode: (enabled: boolean, bookId?: string) => void;
  onClose: () => void;
}

const SERIES_LABELS: Record<string, string> = {
  original: "Frank Herbert's Dune",
  legends: "Legends of Dune",
  prelude: "Prelude to Dune",
  schools: "Great Schools of Dune",
  heroes: "Heroes of Dune",
  caladan: "The Caladan Trilogy",
  "hunters-sandworms": "Sequels to Chapterhouse",
};

const SERIES_ORDER = [
  "original",
  "legends",
  "prelude",
  "schools",
  "heroes",
  "caladan",
  "hunters-sandworms",
];

const STATE_ICONS: Record<BookFilterState, string> = {
  highlighted: "\u25CF", // ●
  contextual: "\u25CB",  // ○
  hidden: "\u2013",      // –
};

const STATE_COLORS: Record<BookFilterState, string> = {
  highlighted: "#e8e0d0",
  contextual: "#5a5548",
  hidden: "#2a2520",
};

export function BookSelector({
  books,
  filters,
  readingMode,
  onCycleBook,
  onHighlightOnly,
  onResetBooks,
  onSetReadingMode,
  onClose,
}: BookSelectorProps) {
  // Group books by series
  const grouped = new Map<string, Book[]>();
  for (const book of books) {
    const list = grouped.get(book.series) ?? [];
    list.push(book);
    grouped.set(book.series, list);
  }

  return (
    <div className="fixed left-0 top-0 bottom-0 w-[340px] bg-[#12121a] border-r border-white/[0.08] z-40 overflow-y-auto transition-transform duration-300">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-[#5a5548] hover:text-[#e8e0d0] transition-colors text-lg w-8 h-8 flex items-center justify-center"
        aria-label="Close book selector"
      >
        &times;
      </button>

      <div className="p-5 pt-12">
        <h2 className="text-xs uppercase tracking-widest text-[#5a5548] mb-3">
          Books
        </h2>

        {/* Reading Mode */}
        <div className="mb-4 p-3 rounded bg-white/[0.02] border border-white/[0.04]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={readingMode.enabled}
              onChange={(e) => onSetReadingMode(e.target.checked, readingMode.current_book)}
              className="accent-[#c4841d]"
            />
            <span className="text-xs text-[#c0b8a8]">Reading Mode</span>
            <span className="text-[9px] text-[#5a5548]">(hides spoilers)</span>
          </label>
          {readingMode.enabled && (
            <select
              value={readingMode.current_book ?? ""}
              onChange={(e) => onSetReadingMode(true, e.target.value || undefined)}
              className="mt-2 w-full bg-[#0a0a0f] border border-white/[0.08] rounded px-2 py-1 text-xs text-[#c0b8a8]"
            >
              <option value="">Select current book...</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={onResetBooks}
          className="text-[10px] text-[#c4841d] mb-4 hover:underline"
        >
          Show all books
        </button>

        {/* Legend */}
        <div className="flex items-center gap-3 mb-3 text-[9px] text-[#5a5548]">
          <span>{STATE_ICONS.highlighted} Highlighted</span>
          <span>{STATE_ICONS.contextual} Dimmed</span>
          <span>{STATE_ICONS.hidden} Hidden</span>
        </div>

        {/* Book list by series */}
        {SERIES_ORDER.map((seriesId) => {
          const seriesBooks = grouped.get(seriesId);
          if (!seriesBooks) return null;

          return (
            <section key={seriesId} className="mb-4">
              <h3 className="text-[10px] uppercase tracking-widest text-[#3a3530] mb-1.5">
                {SERIES_LABELS[seriesId] ?? seriesId}
              </h3>
              <div className="space-y-0.5">
                {seriesBooks
                  .sort((a, b) => a.series_order - b.series_order)
                  .map((book) => {
                    const state = filters[book.id] ?? "highlighted";
                    return (
                      <div key={book.id} className="flex items-center gap-1.5">
                        {/* Three-state toggle */}
                        <button
                          onClick={() => onCycleBook(book.id)}
                          className="w-5 h-5 flex items-center justify-center text-xs shrink-0"
                          style={{ color: STATE_COLORS[state] }}
                          title={`${state} — click to cycle`}
                        >
                          {STATE_ICONS[state]}
                        </button>

                        {/* Book title — click to highlight only */}
                        <button
                          onClick={() => onHighlightOnly(book.id)}
                          className="text-xs text-left truncate transition-colors hover:text-[#c4841d]"
                          style={{
                            color: state === "highlighted" ? "#c0b8a8" : "#5a5548",
                          }}
                          title="Click to highlight only this book"
                        >
                          {book.title}
                        </button>

                        {/* Color indicator */}
                        <span
                          className="w-1.5 h-1.5 rounded-full ml-auto shrink-0"
                          style={{
                            backgroundColor: book.color,
                            opacity: state === "highlighted" ? 1 : 0.2,
                          }}
                        />
                      </div>
                    );
                  })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
