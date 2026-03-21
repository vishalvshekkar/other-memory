import { createContext, useContext, useMemo, type ReactNode } from "react";
import { loadTimelineData, type TimelineDataWithMaps } from "./loader";

const TimelineDataContext = createContext<TimelineDataWithMaps | null>(null);

export function TimelineDataProvider({ children }: { children: ReactNode }) {
  const data = useMemo(() => loadTimelineData(), []);
  return (
    <TimelineDataContext.Provider value={data}>
      {children}
    </TimelineDataContext.Provider>
  );
}

export function useTimelineData(): TimelineDataWithMaps {
  const ctx = useContext(TimelineDataContext);
  if (!ctx) {
    throw new Error("useTimelineData must be used within TimelineDataProvider");
  }
  return ctx;
}
