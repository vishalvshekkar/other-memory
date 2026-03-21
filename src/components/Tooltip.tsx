import { createPortal } from "react-dom";
import type { TimelineEvent } from "@/types";
import { formatAGYear } from "@/utils/calendar";

interface TooltipProps {
  event: TimelineEvent | null;
  position: { x: number; y: number } | null;
}

const SIG_STARS: Record<number, string> = {
  1: "\u2605",
  2: "\u2605\u2605",
  3: "\u2605\u2605\u2605",
  4: "\u2605\u2605\u2605\u2605",
  5: "\u2605\u2605\u2605\u2605\u2605",
};

export function Tooltip({ event, position }: TooltipProps) {
  if (!event || !position) return null;

  // Position tooltip so it stays in viewport
  const x = Math.min(position.x + 12, window.innerWidth - 320);
  const y = Math.min(position.y - 10, window.innerHeight - 200);

  return createPortal(
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: x, top: y }}
    >
      <div className="bg-[#1a1a25] border border-white/10 rounded-lg px-3 py-2 shadow-xl max-w-[300px]">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-[#e8e0d0] leading-tight">
            {event.title}
          </h3>
          <span className="text-[10px] text-[#c4841d] whitespace-nowrap">
            {SIG_STARS[event.significance]}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-[#8a8070]">
            {formatAGYear(event.date_start)}
            {event.date_end && event.date_end !== event.date_start
              ? ` – ${formatAGYear(event.date_end)}`
              : ""}
          </span>
          <span
            className="text-[9px] px-1 rounded"
            style={{
              backgroundColor: `var(--color-cat-${event.category})`,
              opacity: 0.7,
            }}
          >
            {event.category}
          </span>
        </div>
        <p className="text-xs text-[#8a8070] mt-1.5 leading-relaxed line-clamp-2">
          {event.description}
        </p>
      </div>
    </div>,
    document.body,
  );
}
