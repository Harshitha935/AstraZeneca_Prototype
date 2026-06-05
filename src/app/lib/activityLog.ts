export const DEMO_QUERY =
  "What's the current evidence on [drug] in patients who've already progressed on a PD-1 inhibitor — any real-world data beyond the trial population?";

export type PortalType = "open" | "student" | "hcp";

export type ActionType =
  | "demo_query_click"
  | "query_submit"
  | "results_shown"
  | "cta_dismiss"
  | "copy_answer";

export type AccessResult =
  | "gated_registration_required"
  | "gated_out_of_scope"
  | "answered_light_search"
  | "answered_medium_search"
  | "answered_deep_search"
  | "n/a";

export type SearchMode = "Light Search" | "Medium Search" | "Deep Search" | "—";

export interface LogEntry {
  id: string;
  timestamp: string;
  sessionId: string;
  portalType: PortalType;
  action: ActionType;
  query: string;
  accessResult: AccessResult;
  searchMode: SearchMode;
  sourcesReturned: number;
}

const SESSION_ID = Math.random().toString(36).slice(2, 10).toUpperCase();

const _entries: LogEntry[] = [];

export function logEvent(
  fields: Omit<LogEntry, "id" | "timestamp" | "sessionId">,
): void {
  _entries.push({
    id: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    sessionId: SESSION_ID,
    ...fields,
  });
}

export function getLog(): readonly LogEntry[] {
  return _entries;
}

export function clearLog(): void {
  _entries.length = 0;
}
