import type { TimelineEvent, Book } from "@/types";
import { formatAGYear } from "@/utils/calendar";
import { contrastTextForCategory } from "@/utils/contrast";
import { SignalBars } from "./SignalBars";
import type { TimelineDataWithMaps } from "@/data/loader";

interface DetailPanelProps {
  event: TimelineEvent;
  data: TimelineDataWithMaps;
  onClose: () => void;
  onNavigate: (eventId: string) => void;
  onZoomToEvent: (eventId: string) => void;
}

const SIG_LABELS: Record<number, string> = {
  1: "Minor detail",
  2: "Notable",
  3: "Significant",
  4: "Major turning point",
  5: "Universe-altering",
};

export function DetailPanel({ event, data, onClose, onNavigate, onZoomToEvent }: DetailPanelProps) {
  // Find related events (share tags or factions)
  const related = data.events.filter(
    (e) =>
      e.id !== event.id &&
      (e.tags.some((t) => event.tags.includes(t)) ||
        e.factions.some((f) => event.factions.includes(f))),
  ).slice(0, 5);

  // Resolve book references
  const referencedBooks: (Book & { notes?: string })[] = [];
  for (const ref of event.books) {
    const book = data.booksById.get(ref.book_id);
    if (book) {
      referencedBooks.push({ ...book, notes: ref.notes });
    }
  }

  return (
    <div className="fixed right-0 top-0 bottom-0 w-[380px] bg-[#12121a] border-l border-white/[0.08] z-40 overflow-y-auto transition-transform duration-300">
      {/* Top buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {/* Zoom to event button */}
        <button
          onClick={() => onZoomToEvent(event.id)}
          className="text-[#5a5548] hover:text-[#c4841d] transition-colors w-8 h-8 flex items-center justify-center rounded hover:bg-white/[0.04]"
          aria-label="Zoom to this event on the timeline"
          title="Zoom to this event"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="5.5" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
            <line x1="8" y1="0.5" x2="8" y2="3" />
            <line x1="8" y1="13" x2="8" y2="15.5" />
            <line x1="0.5" y1="8" x2="3" y2="8" />
            <line x1="13" y1="8" x2="15.5" y2="8" />
          </svg>
        </button>
        {/* Close button */}
        <button
          onClick={onClose}
          className="text-[#5a5548] hover:text-[#e8e0d0] transition-colors text-lg w-8 h-8 flex items-center justify-center"
          aria-label="Close detail panel"
        >
          &times;
        </button>
      </div>

      <div className="p-5 pt-12">
        {/* Event type badge */}
        <span className="text-[10px] uppercase tracking-widest text-[#5a5548]">
          {event.type}
        </span>

        {/* Title */}
        <h2 className="text-lg font-semibold text-[#e8e0d0] mt-1 font-['Cinzel'] leading-tight">
          {event.title}
        </h2>
        {event.subtitle && (
          <p className="text-sm text-[#8a8070] mt-0.5 italic">{event.subtitle}</p>
        )}

        {/* Date */}
        <p className="text-sm text-[#c4841d] mt-2">
          {formatAGYear(event.date_start)}
          {event.date_end && event.date_end !== event.date_start
            ? ` – ${formatAGYear(event.date_end)}`
            : ""}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-3 text-xs">
          <span
            className="px-2 py-0.5 rounded"
            style={{
              backgroundColor: `var(--color-cat-${event.category})`,
              color: contrastTextForCategory(event.category),
            }}
          >
            {event.category}
          </span>
          <span className="flex items-center gap-1.5 text-[#8a8070]">
            <SignalBars level={event.significance} />
            {SIG_LABELS[event.significance]}
          </span>
        </div>

        <hr className="border-white/[0.06] my-4" />

        {/* Description */}
        <p className="text-sm text-[#c0b8a8] leading-relaxed">
          {event.description}
        </p>

        {/* Detailed content */}
        {event.detailed && (
          <div className="mt-3 text-sm text-[#8a8070] leading-relaxed whitespace-pre-wrap">
            {event.detailed}
          </div>
        )}

        {/* Books */}
        {referencedBooks.length > 0 && (
          <>
            <hr className="border-white/[0.06] my-4" />
            <h3 className="text-xs uppercase tracking-widest text-[#5a5548] mb-2">
              Referenced in
            </h3>
            <ul className="space-y-1.5">
              {referencedBooks.map((book) => (
                <li key={book.id} className="text-sm">
                  <span className="text-[#c0b8a8]">{book.title}</span>
                  {(book as Book & { notes?: string }).notes && (
                    <span className="text-[#5a5548] ml-1">
                      ({(book as Book & { notes?: string }).notes})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Characters */}
        {event.characters.length > 0 && (
          <>
            <hr className="border-white/[0.06] my-4" />
            <h3 className="text-xs uppercase tracking-widest text-[#5a5548] mb-2">
              Characters
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {event.characters.map((c) => (
                <span
                  key={c}
                  className="text-xs px-2 py-0.5 bg-white/[0.04] rounded text-[#8a8070]"
                >
                  {c.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Factions */}
        {event.factions.length > 0 && (
          <>
            <hr className="border-white/[0.06] my-4" />
            <h3 className="text-xs uppercase tracking-widest text-[#5a5548] mb-2">
              Factions
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {event.factions.map((f) => {
                const faction = data.factionsById.get(f);
                return (
                  <span
                    key={f}
                    className="text-xs px-2 py-0.5 rounded text-[#e8e0d0]"
                    style={{
                      backgroundColor: faction
                        ? `${faction.color}33`
                        : "rgba(255,255,255,0.04)",
                      borderLeft: faction
                        ? `2px solid ${faction.color}`
                        : undefined,
                    }}
                  >
                    {faction?.name ?? f.replace(/-/g, " ")}
                  </span>
                );
              })}
            </div>
          </>
        )}

        {/* Related Events */}
        {related.length > 0 && (
          <>
            <hr className="border-white/[0.06] my-4" />
            <h3 className="text-xs uppercase tracking-widest text-[#5a5548] mb-2">
              Related Events
            </h3>
            <ul className="space-y-1">
              {related.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => onNavigate(r.id)}
                    className="text-sm text-[#1a6b8a] hover:text-[#c4841d] transition-colors text-left"
                  >
                    {r.title}
                    <span className="text-[#5a5548] ml-1 text-xs">
                      {formatAGYear(r.date_start)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Tags */}
        {event.tags.length > 0 && (
          <>
            <hr className="border-white/[0.06] my-4" />
            <div className="flex flex-wrap gap-1">
              {event.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5 bg-white/[0.03] rounded text-[#5a5548]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
