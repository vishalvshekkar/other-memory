// ============================================================================
// Calendar & Time
// ============================================================================

/** All dates in the system are AG (After Guild) year numbers. Negative = BG. */
export type AGYear = number;

export type DatePrecision = "exact" | "approximate" | "estimated" | "unknown";

export interface CalendarConfig {
  /** Expanded Dune anchor: AG 0 = this CE year (13,160) */
  ce_anchor_expanded: number;
  /** Dune Encyclopedia anchor: AG 0 = this CE year (16,200) */
  ce_anchor_encyclopedia: number;
  display_calendars: CalendarDisplay[];
}

export interface CalendarDisplay {
  id: "ag" | "ce-expanded" | "ce-encyclopedia";
  label: string;
  primary: boolean;
}

// ============================================================================
// Events
// ============================================================================

export type EventType = "point" | "span" | "milestone" | "era" | "arc";

export interface BookReference {
  book_id: string;
  chapters?: string[];
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  type: EventType;
  title: string;
  subtitle?: string;
  description: string;
  detailed?: string;

  // Temporal
  date_start: AGYear;
  date_end?: AGYear;
  date_precision: DatePrecision;

  // Classification
  significance: 1 | 2 | 3 | 4 | 5;
  category: CategoryId;
  tags: string[];
  factions: string[];
  characters: string[];

  // Sources
  books: BookReference[];

  // Visual overrides
  color?: string;
  icon?: string;
  lane?: string;

  // Era-specific
  nesting_level?: number;
  parent_era?: string | null;

  // Arc-specific
  arc_events?: string[];
}

/** A point event — a discrete moment in time */
export interface PointEvent extends TimelineEvent {
  type: "point";
}

/** A span event — something that lasted a duration */
export interface SpanEvent extends TimelineEvent {
  type: "span";
  date_end: AGYear;
}

/** A milestone — a pivotal point event with elevated visual treatment */
export interface MilestoneEvent extends TimelineEvent {
  type: "milestone";
}

/** An era — a named historical period rendered as a background band */
export interface EraEvent extends TimelineEvent {
  type: "era";
  date_end: AGYear;
  nesting_level: number;
  parent_era: string | null;
}

/** A narrative arc — connects a sequence of events */
export interface ArcEvent extends TimelineEvent {
  type: "arc";
  arc_events: string[];
}

// ============================================================================
// Books
// ============================================================================

export type BookSeries =
  | "original"
  | "prelude"
  | "legends"
  | "heroes"
  | "schools"
  | "caladan"
  | "great-schools"
  | "hunters-sandworms";

export interface Book {
  id: string;
  title: string;
  author: string;
  publication_year: number;
  series: BookSeries;
  series_order: number;
  timeline_start: AGYear;
  timeline_end: AGYear;
  color: string;
}

// ============================================================================
// Categories & Factions
// ============================================================================

export type CategoryId =
  | "political"
  | "military"
  | "ecological"
  | "religious"
  | "technological"
  | "personal"
  | "cultural";

export interface Category {
  id: CategoryId;
  label: string;
  color: string;
  description: string;
}

export interface Faction {
  id: string;
  name: string;
  color: string;
  description: string;
  active_start?: AGYear;
  active_end?: AGYear;
}

// ============================================================================
// Filtering
// ============================================================================

export type BookFilterState = "highlighted" | "contextual" | "hidden";

export interface FilterState {
  books: Record<string, BookFilterState>;
  categories: Record<CategoryId, boolean>;
  factions: string[];
  characters: string[];
  min_significance: 1 | 2 | 3 | 4 | 5;
  search_query: string;
  reading_mode: {
    enabled: boolean;
    current_book?: string;
  };
}

// ============================================================================
// Camera & Zoom
// ============================================================================

export interface CameraState {
  /** The AG year at the center of the viewport */
  center: AGYear;
  /** Pixels per AG year — determines zoom level */
  pixels_per_year: number;
}

export type ZoomTier = 1 | 2 | 3 | 4 | 5 | 6;

export interface ZoomTierConfig {
  tier: ZoomTier;
  label: string;
  min_ppy: number;
  max_ppy: number;
  min_significance: 1 | 2 | 3 | 4 | 5;
}

// ============================================================================
// Layout
// ============================================================================

export type Orientation = "horizontal" | "vertical";

export interface LayoutState {
  orientation: Orientation;
  width: number;
  height: number;
  minimap_visible: boolean;
  detail_panel_open: boolean;
  selected_event_id: string | null;
}

// ============================================================================
// Clustering
// ============================================================================

export interface EventCluster {
  /** Events in this cluster */
  event_ids: string[];
  /** Center AG year of the cluster */
  center_year: AGYear;
  /** Time span covered by the cluster */
  year_start: AGYear;
  year_end: AGYear;
  /** Highest significance in the cluster */
  max_significance: 1 | 2 | 3 | 4 | 5;
  /** The most significant event's title (shown as cluster label) */
  primary_title: string;
  /** Category breakdown for color blending */
  category_counts: Partial<Record<CategoryId, number>>;
}

// ============================================================================
// Density Heatmap
// ============================================================================

export interface DensityBucket {
  year_start: AGYear;
  year_end: AGYear;
  count: number;
  /** Normalized 0-1 density value for rendering */
  normalized: number;
}

// ============================================================================
// URL State (for shareable links)
// ============================================================================

export interface URLState {
  /** Center year */
  t?: AGYear;
  /** Zoom tier */
  z?: ZoomTier;
  /** Highlighted book filter */
  f?: string;
  /** Active categories (comma-separated) */
  c?: string;
  /** Selected event */
  e?: string;
}

// ============================================================================
// Media (Movies & TV Shows)
// ============================================================================

export type MediaType = "film" | "tv-series" | "tv-miniseries";

export interface MediaEntry {
  id: string;
  title: string;
  type: MediaType;
  release_year: number;
  end_year?: number;
  director?: string;
  creator?: string;
  network?: string;
  timeline_start: AGYear;
  timeline_end: AGYear;
  adapts: string;
  color: string;
  description: string;
}

// ============================================================================
// Data Bundle (what gets loaded at runtime)
// ============================================================================

export interface TimelineData {
  config: CalendarConfig;
  books: Book[];
  categories: Category[];
  factions: Faction[];
  eras: EraEvent[];
  events: TimelineEvent[];
  arcs: ArcEvent[];
  media: MediaEntry[];
}
