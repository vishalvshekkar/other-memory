/**
 * HelpGuide — a full visual manual for the Dune Timeline.
 * Opens as a full-screen overlay with detailed usage instructions,
 * visual legends, and information about the dual calendar systems.
 */

interface HelpGuideProps {
  onClose: () => void;
}

// ─── Visual legend components ───

function Diamond({ color, size = 14 }: { color: string; size?: number }) {
  const half = size / 2;
  return (
    <svg width={size} height={size} className="inline-block shrink-0">
      <polygon
        points={`${half},0 ${size},${half} ${half},${size} 0,${half}`}
        fill={color}
      />
    </svg>
  );
}

function Circle({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} className="inline-block shrink-0">
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill={color} />
      <circle cx={size / 2} cy={size / 2} r={size / 4} fill="#0a0a0f" />
    </svg>
  );
}

function SpanBar({ color }: { color: string }) {
  return (
    <div
      className="inline-block w-16 h-4 rounded-sm shrink-0"
      style={{ backgroundColor: color, opacity: 0.85 }}
    />
  );
}

function DashedArc({ color }: { color: string }) {
  return (
    <svg width={48} height={20} className="inline-block shrink-0">
      <path
        d="M 4 18 Q 24 0, 44 18"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
      <circle cx={4} cy={18} r={2.5} fill={color} />
      <circle cx={44} cy={18} r={2.5} fill={color} />
    </svg>
  );
}

function EraStripe() {
  return (
    <div className="inline-block w-16 h-5 shrink-0 relative rounded-sm overflow-hidden">
      <div className="absolute inset-0 bg-white/[0.03]" />
      <div className="absolute left-0 top-0 bottom-0 w-px bg-white/[0.09]" />
    </div>
  );
}

function HeatmapBar() {
  return (
    <div className="inline-block w-16 h-1.5 shrink-0 rounded-full overflow-hidden">
      <div
        className="h-full"
        style={{
          background: "linear-gradient(to right, transparent, rgba(196,132,29,0.1), rgba(196,132,29,0.5), rgba(196,132,29,0.2), transparent)",
        }}
      />
    </div>
  );
}

// ─── Category color map ───

const CATEGORIES = [
  { id: "political", label: "Political", color: "#c4a435", desc: "Governance, dynasties, power shifts" },
  { id: "military", label: "Military", color: "#b83a3a", desc: "Battles, wars, conquests" },
  { id: "ecological", label: "Ecological", color: "#2a9d6e", desc: "Spice, sandworms, terraforming" },
  { id: "religious", label: "Religious", color: "#7b4db5", desc: "Bene Gesserit, prophecy, faith" },
  { id: "technological", label: "Technological", color: "#4a8db5", desc: "Thinking machines, inventions" },
  { id: "personal", label: "Personal", color: "#d4c5a9", desc: "Births, deaths, character moments" },
  { id: "cultural", label: "Cultural", color: "#c47a35", desc: "Social changes, traditions, customs" },
];

const SHORTCUTS = [
  { key: "Scroll", desc: "Zoom in/out at cursor position" },
  { key: "Drag", desc: "Pan through time" },
  { key: "Click", desc: "Select an event to view details" },
  { key: "+ / -", desc: "Step zoom in/out" },
  { key: "1-6", desc: "Jump directly to a zoom tier" },
  { key: "0", desc: "Fit entire timeline to screen" },
  { key: "Home / End", desc: "Jump to start/end of timeline" },
  { key: "/", desc: "Open search" },
  { key: "F", desc: "Toggle filter panel" },
  { key: "B", desc: "Toggle book selector" },
  { key: "Esc", desc: "Close any open panel" },
  { key: "?", desc: "Keyboard shortcuts quick reference" },
];

export function HelpGuide({ onClose }: HelpGuideProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-[#0a0a0f]/95 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-w-[680px] mx-auto px-6 py-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 text-[#5a5548] hover:text-[#e8e0d0] transition-colors text-xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/[0.04] z-10"
          aria-label="Close guide"
        >
          &times;
        </button>

        {/* Title */}
        <h1 className="font-['Cinzel'] text-2xl tracking-[0.15em] text-[#c4841d] uppercase text-center">
          Dune Timeline
        </h1>
        <p className="text-center text-sm text-[#8a8070] mt-2">
          An interactive guide to ~35,000 years of the Dune universe
        </p>

        <hr className="border-white/[0.06] my-8" />

        {/* ── Section: What You're Looking At ── */}
        <Section title="What You're Looking At">
          <p className="text-sm text-[#c0b8a8] leading-relaxed">
            The timeline shows the complete history of the Dune universe — from the
            Time of Titans through the return from the Scattering and Kralizec. Time flows
            left to right. You can zoom in from a 35,000-year overview down to individual
            years within a single book's events.
          </p>
        </Section>

        {/* ── Section: Visual Elements ── */}
        <Section title="Visual Elements">

          <LegendRow icon={<EraStripe />} label="Era Bands">
            Semi-transparent vertical bands spanning the full height. These mark
            major historical periods like the Corrino Empire or the Scattering.
            Names appear in serif font at the top. Nested eras (like "God Emperor's
            Reign" within "Atreides Empire") are slightly brighter. Thin vertical
            lines mark era boundaries.
          </LegendRow>

          <LegendRow icon={<Diamond color="#c4a435" />} label="Milestone (Diamond)">
            Universe-altering pivot points — the most significant events. Larger
            diamonds = higher significance. Color indicates the event category
            (see below).
          </LegendRow>

          <LegendRow icon={<Circle color="#b83a3a" />} label="Point Event (Circle)">
            A discrete moment in time. Smaller than milestones. These appear
            as you zoom in past the millennia view. The hollow center distinguishes
            them from milestones.
          </LegendRow>

          <LegendRow icon={<SpanBar color="#b83a3a" />} label="Span Event (Bar)">
            An event that lasted over a period of time (e.g., Muad'Dib's Jihad
            spanning several years). The bar's width represents duration. Label
            appears inside when wide enough.
          </LegendRow>

          <LegendRow icon={<DashedArc color="#c4841d" />} label="Narrative Arc (Dashed Curve)">
            A connecting line tracing a story thread across multiple events. For example,
            "The Golden Path" connects Paul's rise through Leto II's death. Dots mark
            each event in the arc. The arc name appears at the midpoint.
          </LegendRow>

          <LegendRow icon={<HeatmapBar />} label="Density Heatmap (Orange Strip)">
            A subtle gradient strip just above the time axis. Brighter orange = more
            events clustered in that region. This is your "hotspot" indicator — even
            when fully zoomed out and events aren't individually visible, you can
            see where the action concentrates.
          </LegendRow>

        </Section>

        {/* ── Section: Category Colors ── */}
        <Section title="Category Colors">
          <p className="text-sm text-[#8a8070] mb-3">
            Every event belongs to a category. The color of its marker (diamond, circle,
            or bar) tells you the category at a glance:
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Diamond color={cat.color} size={10} />
                <span className="text-xs text-[#e8e0d0]">{cat.label}</span>
                <span className="text-[10px] text-[#5a5548]">— {cat.desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section: Navigation ── */}
        <Section title="Navigation">
          <div className="space-y-3">
            <NavItem title="Zoom" keys="Scroll wheel, + / -, or 1-6 tier keys">
              Scroll your mouse wheel or trackpad to zoom in and out. Zoom is centered
              on your cursor position — point at what you want to see closer. Press
              number keys 1-6 to jump directly to a zoom tier, or 0 to fit everything.
            </NavItem>
            <NavItem title="Pan" keys="Click + drag, or arrow keys">
              Click and drag the timeline to move through time. The timeline has momentum —
              flick and release for a smooth coast. Use arrow keys for precise nudges.
            </NavItem>
            <NavItem title="Select" keys="Click an event marker">
              Click any diamond, circle, or bar to open its detail panel on the right.
              The panel shows the full description, book references, characters, factions,
              and related events. Click a related event to navigate there.
            </NavItem>
            <NavItem title="Search" keys="/ key or header button">
              Press / to open search. Type any name, event, character, or faction.
              Results appear instantly. Use arrow keys to navigate, Enter to select.
              The timeline centers on the selected event.
            </NavItem>
            <NavItem title="Zoom to Event" keys="Target button in detail panel">
              When viewing an event's details, click the target icon to zoom the
              timeline to that event's location at a level where surrounding events
              are individually visible.
            </NavItem>
          </div>
        </Section>

        {/* ── Section: Zoom Tiers ── */}
        <Section title="Zoom Tiers">
          <p className="text-sm text-[#8a8070] mb-3">
            The timeline has 6 zoom levels. At wider views, only the most significant
            events are shown to avoid clutter. Zoom in to reveal more:
          </p>
          <div className="space-y-1">
            {[
              { tier: 1, name: "Full Timeline", range: "35,000+ years", shows: "Only universe-altering events" },
              { tier: 2, name: "Millennia", range: "5,000–35,000 yrs", shows: "Major turning points added" },
              { tier: 3, name: "Centuries", range: "500–5,000 yrs", shows: "Significant events + labels" },
              { tier: 4, name: "Decades", range: "50–500 yrs", shows: "Notable events visible" },
              { tier: 5, name: "Years", range: "5–50 yrs", shows: "All events shown" },
              { tier: 6, name: "Months", range: "< 5 yrs", shows: "Maximum detail" },
            ].map((t) => (
              <div key={t.tier} className="flex items-center gap-2 text-xs">
                <kbd className="w-5 h-5 flex items-center justify-center bg-white/[0.04] border border-white/[0.08] rounded text-[10px] text-[#c4841d] font-mono">
                  {t.tier}
                </kbd>
                <span className="text-[#e8e0d0] min-w-[80px]">{t.name}</span>
                <span className="text-[#5a5548]">{t.range}</span>
                <span className="text-[#3a3530]">—</span>
                <span className="text-[#8a8070]">{t.shows}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section: Filtering ── */}
        <Section title="Filtering & Book Mode">
          <div className="space-y-3 text-sm text-[#c0b8a8] leading-relaxed">
            <p>
              Press <Kbd>F</Kbd> to open the <strong>filter panel</strong>. Toggle event
              categories on/off, filter by faction, or adjust the minimum significance level.
            </p>
            <p>
              Press <Kbd>B</Kbd> to open the <strong>book selector</strong>. Each of the 22
              Dune novels has a three-state toggle:
            </p>
            <ul className="space-y-1 ml-4">
              <li className="flex items-center gap-2">
                <span className="text-[#e8e0d0]">{"\u25CF"}</span>
                <span><strong>Highlighted</strong> — full color, primary focus</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#5a5548]">{"\u25CB"}</span>
                <span><strong>Dimmed</strong> — visible but faded, for context</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#2a2520]">{"\u2013"}</span>
                <span><strong>Hidden</strong> — removed from view</span>
              </li>
            </ul>
            <p>
              <strong>Reading Mode</strong> is designed for people currently reading a book.
              Select which book you're on — events from that book are highlighted, earlier
              books are dimmed for context, and future books are hidden to prevent spoilers.
            </p>
          </div>
        </Section>

        {/* ── Section: The Two Calendars ── */}
        <Section title="The Two Dune Calendars">
          <div className="text-sm text-[#c0b8a8] leading-relaxed space-y-3">
            <p>
              The Dune universe uses its own calendar system: <strong>AG</strong> (After Guild)
              and <strong>BG</strong> (Before Guild), anchored to the founding of the Spacing
              Guild at year zero. All events on this timeline are stored in AG.
            </p>
            <p>
              But how does this map to our real-world calendar? Two canonical sources
              give different answers:
            </p>

            <div className="rounded-lg border border-[#1a6b8a]/30 bg-[#1a6b8a]/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-0.5 rounded-full bg-[#1a6b8a]" />
                <span className="text-xs font-semibold text-[#1a6b8a]">
                  Expanded Dune (Brian Herbert / Kevin J. Anderson)
                </span>
              </div>
              <p className="text-xs text-[#8a8070]">
                11,200 BG = 1960 CE (the beginning of space travel — Pioneer 5 launch).
                This makes AG 0 = <strong>13,160 CE</strong> and the events of Dune (10,191 AG)
                fall around <strong>23,351 CE</strong>.
              </p>
            </div>

            <div className="rounded-lg border border-[#2a9d6e]/30 bg-[#2a9d6e]/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-0.5 rounded-full bg-[#2a9d6e]" />
                <span className="text-xs font-semibold text-[#2a9d6e]">
                  Dune Encyclopedia (1984, Willis McNelly / Frank Herbert)
                </span>
              </div>
              <p className="text-xs text-[#8a8070]">
                16,200 BG = 0 CE (the Birth of Christ). This makes AG 0 = <strong>16,200 CE</strong> and
                the events of Dune fall around <strong>26,391 CE</strong>.
              </p>
            </div>

            <p>
              The two systems disagree by <strong>3,040 years</strong>. When you toggle the
              <Kbd>CE</Kbd> button in the header, both are shown simultaneously — the Expanded
              Dune mapping in <span className="text-[#1a6b8a]">blue</span> and the Encyclopedia
              mapping in <span className="text-[#2a9d6e]">green</span> — so fans of either
              canon can see their preferred real-world anchor.
            </p>
            <p>
              Under both systems, today ({new Date().getFullYear()} CE) falls thousands of years
              before any event in the Dune universe. Frank Herbert imagined this saga as
              humanity's deep, deep future.
            </p>
          </div>
        </Section>

        {/* ── Section: Keyboard Shortcuts ── */}
        <Section title="Keyboard Shortcuts">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {SHORTCUTS.map(({ key, desc }) => (
              <div key={key} className="flex items-center gap-2">
                <kbd className="text-[10px] bg-white/[0.04] border border-white/[0.08] rounded px-1.5 py-0.5 text-[#c4841d] font-mono min-w-[55px] text-center">
                  {key}
                </kbd>
                <span className="text-xs text-[#8a8070]">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section: Contributing ── */}
        <Section title="Contributing">
          <p className="text-sm text-[#c0b8a8] leading-relaxed">
            This timeline is community-driven. All event data lives in YAML files
            that anyone can edit. If you spot a missing event, an inaccuracy, or want to
            add more detail — open a pull request on the GitHub repository. See the
            CONTRIBUTING.md file for guidelines on adding events, choosing significance
            levels, and citing sources.
          </p>
        </Section>

        <hr className="border-white/[0.06] my-8" />

        <p className="text-center text-[10px] text-[#3a3530]">
          Press Esc or click outside to close
        </p>
      </div>
    </div>
  );
}

// ─── Helper components ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-['Cinzel'] text-sm tracking-[0.1em] text-[#8a8070] uppercase mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function LegendRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 mb-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-xs font-medium text-[#e8e0d0] mb-0.5">{label}</div>
        <div className="text-xs text-[#8a8070] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function NavItem({
  title,
  keys,
  children,
}: {
  title: string;
  keys: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-xs font-medium text-[#e8e0d0]">{title}</span>
        <span className="text-[9px] text-[#5a5548]">({keys})</span>
      </div>
      <p className="text-xs text-[#8a8070] leading-relaxed">{children}</p>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="text-[10px] bg-white/[0.04] border border-white/[0.08] rounded px-1 py-0.5 text-[#c4841d] font-mono mx-0.5">
      {children}
    </kbd>
  );
}
