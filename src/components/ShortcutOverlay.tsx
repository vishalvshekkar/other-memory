interface ShortcutOverlayProps {
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "← →", desc: "Pan timeline" },
  { key: "+ -", desc: "Zoom in / out" },
  { key: "1-6", desc: "Jump to zoom tier" },
  { key: "0", desc: "Fit entire timeline" },
  { key: "Home / End", desc: "Jump to start / end" },
  { key: "/", desc: "Search events" },
  { key: "F", desc: "Toggle filters" },
  { key: "B", desc: "Toggle book selector" },
  { key: "Space", desc: "Toggle detail panel" },
  { key: "Esc", desc: "Close panels" },
  { key: "?", desc: "Show this help" },
  { key: "Scroll", desc: "Zoom at cursor" },
  { key: "Drag", desc: "Pan timeline" },
  { key: "Click", desc: "Select event" },
];

export function ShortcutOverlay({ onClose }: ShortcutOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#12121a] border border-white/[0.1] rounded-xl shadow-2xl p-6 w-[420px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-['Cinzel'] tracking-widest text-[#8a8070] uppercase">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-[#5a5548] hover:text-[#e8e0d0] transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {SHORTCUTS.map(({ key, desc }) => (
            <div key={key} className="flex items-center gap-2">
              <kbd className="text-[10px] bg-white/[0.04] border border-white/[0.08] rounded px-1.5 py-0.5 text-[#c4841d] font-mono min-w-[50px] text-center">
                {key}
              </kbd>
              <span className="text-xs text-[#8a8070]">{desc}</span>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-[#3a3530] mt-4 text-center">
          Press Esc or click outside to close
        </p>
      </div>
    </div>
  );
}
