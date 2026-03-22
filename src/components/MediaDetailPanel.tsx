import type { MediaEntry } from "@/types";

interface MediaDetailPanelProps {
  media: MediaEntry;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  film: "Film",
  "tv-series": "TV Series",
  "tv-miniseries": "TV Miniseries",
};

export function MediaDetailPanel({ media, onClose }: MediaDetailPanelProps) {
  return (
    <div className="fixed right-0 top-0 bottom-0 w-[380px] bg-[#12121a] border-l border-white/[0.08] z-40 overflow-y-auto transition-transform duration-300">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-[#5a5548] hover:text-[#e8e0d0] transition-colors text-lg w-8 h-8 flex items-center justify-center"
        aria-label="Close"
      >
        &times;
      </button>

      <div className="p-5 pt-12">
        {/* Type badge */}
        <span className="text-[10px] uppercase tracking-widest text-[#5a5548]">
          Screen Adaptation &middot; {TYPE_LABELS[media.type] ?? media.type}
        </span>

        {/* Title */}
        <h2 className="text-lg font-semibold text-[#e8e0d0] mt-1 font-['Cinzel'] leading-tight">
          {media.title}
        </h2>

        {/* Release info */}
        <div className="flex items-center gap-2 mt-2 text-sm">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: media.color }}
          />
          <span className="text-[#c4841d]">
            {media.release_year}
            {media.end_year ? `–${media.end_year}` : ""}
          </span>
        </div>

        <hr className="border-white/[0.06] my-4" />

        {/* Credits */}
        <div className="space-y-2">
          {media.director && (
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#5a5548]">
                Director
              </span>
              <p className="text-sm text-[#c0b8a8]">{media.director}</p>
            </div>
          )}
          {media.creator && (
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#5a5548]">
                Creator
              </span>
              <p className="text-sm text-[#c0b8a8]">{media.creator}</p>
            </div>
          )}
          {media.network && (
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#5a5548]">
                Network
              </span>
              <p className="text-sm text-[#c0b8a8]">{media.network}</p>
            </div>
          )}
        </div>

        <hr className="border-white/[0.06] my-4" />

        {/* Timeline coverage */}
        <span className="text-[10px] uppercase tracking-widest text-[#5a5548]">
          Timeline Coverage
        </span>
        <p className="text-sm text-[#c0b8a8] mt-1">
          {media.timeline_start === media.timeline_end
            ? `${media.timeline_start.toLocaleString()} AG`
            : `${media.timeline_start.toLocaleString()} AG – ${media.timeline_end.toLocaleString()} AG`}
        </p>

        <hr className="border-white/[0.06] my-4" />

        {/* Source material */}
        <span className="text-[10px] uppercase tracking-widest text-[#5a5548]">
          Adapts
        </span>
        <p className="text-sm text-[#c0b8a8] mt-1">{media.adapts}</p>

        <hr className="border-white/[0.06] my-4" />

        {/* Description */}
        <p className="text-sm text-[#8a8070] leading-relaxed">
          {media.description}
        </p>
      </div>
    </div>
  );
}
