import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Download,
  Search,
  Filter,
  BarChart2,
  Clock,
  MousePointerClick,
  Copy,
  Play,
  BookOpen,
  Navigation,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Eye,
  TrendingUp,
  Hash,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type ActionType =
  | "section_clicked"
  | "transcript_opened"
  | "clip_watched"
  | "summary_copied"
  | "key_moment_selected"
  | "category_filter_used"
  | "search_performed"
  | "page_navigated";

type NavSource = "chat_prompt" | "manual_click" | "search" | "recommendation";

interface LogEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  eventTitle: string;
  sectionName: string;
  actionType: ActionType;
  navSource: NavSource;
  device: string;
  os: string;
  durationMs?: number;
  searchTerm?: string;
  filterValue?: string;
}

// ── Seed data ─────────────────────────────────────────────────────────────
function hashId(n: number): string {
  const pool = "abcdef0123456789";
  let s = "s_";
  let x = n * 2654435761;
  for (let i = 0; i < 8; i++) {
    s += pool[x % 16];
    x = Math.floor(x / 3) + 7;
  }
  return s;
}

const SECTIONS = [
  "DDR Pathway Overview",
  "PARP Inhibitor Mechanism",
  "ATR/ATM Inhibition & Replication Stress",
  "Osimertinib + ATR — MANTA Trial",
  "Biomarker-Driven Patient Selection",
];

const DEVICES = ["Desktop · Chrome 124", "Desktop · Safari 17", "Tablet · Chrome 124", "Desktop · Edge 121", "Desktop · Firefox 125"];
const OS_LIST = ["macOS 14", "Windows 11", "macOS 13", "iPadOS 17", "Windows 10"];

const ACTION_WEIGHTS: { action: ActionType; weight: number }[] = [
  { action: "section_clicked", weight: 28 },
  { action: "transcript_opened", weight: 18 },
  { action: "clip_watched", weight: 14 },
  { action: "summary_copied", weight: 12 },
  { action: "key_moment_selected", weight: 10 },
  { action: "category_filter_used", weight: 8 },
  { action: "search_performed", weight: 6 },
  { action: "page_navigated", weight: 4 },
];

const NAV_WEIGHTS: { src: NavSource; weight: number }[] = [
  { src: "chat_prompt", weight: 38 },
  { src: "manual_click", weight: 30 },
  { src: "recommendation", weight: 22 },
  { src: "search", weight: 10 },
];

const SEARCH_TERMS = ["MANTA trial", "ATR inhibitor", "osimertinib resistance", "HRD score", "ceralasertib", "biomarker"];
const FILTER_VALUES = ["Clinical Data", "Efficacy", "Patient Selection", "Safety", "Q&A"];

function weightedPick<T>(items: { weight: number }[], pool: T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = (Date.now() % total) + pool.length; // deterministic-ish
  for (let i = 0; i < items.length; i++) {
    r -= items[i].weight;
    if (r <= 0) return pool[i];
  }
  return pool[0];
}

function seedEvents(): LogEvent[] {
  const events: LogEvent[] = [];
  const base = new Date("2026-06-04T08:00:00Z").getTime();
  let t = base;
  let sessionCounter = 1;
  let sessionSize = 0;
  let maxSession = 4 + (sessionCounter % 3);

  for (let i = 0; i < 87; i++) {
    if (sessionSize >= maxSession) {
      sessionCounter++;
      sessionSize = 0;
      maxSession = 3 + (sessionCounter % 5);
      t += 120_000 + (sessionCounter * 73_000) % 900_000;
    }
    t += 12_000 + (i * 17_000) % 180_000;

    const action = weightedPick<ActionType>(ACTION_WEIGHTS, ACTION_WEIGHTS.map((w) => w.action));
    const navSrc = weightedPick<NavSource>(NAV_WEIGHTS, NAV_WEIGHTS.map((w) => w.src));
    const sectionIdx = (i * 7 + sessionCounter * 3) % SECTIONS.length;
    const deviceIdx = (sessionCounter * 3) % DEVICES.length;

    const ev: LogEvent = {
      id: `ev_${i.toString().padStart(3, "0")}`,
      sessionId: hashId(sessionCounter),
      timestamp: new Date(t).toISOString(),
      eventTitle: "DDR Bench-to-Bedside Webinar",
      sectionName: SECTIONS[sectionIdx],
      actionType: action,
      navSource: navSrc,
      device: DEVICES[deviceIdx],
      os: OS_LIST[deviceIdx % OS_LIST.length],
    };
    if (action === "clip_watched") ev.durationMs = 30_000 + (i * 13_000) % 120_000;
    if (action === "search_performed") ev.searchTerm = SEARCH_TERMS[i % SEARCH_TERMS.length];
    if (action === "category_filter_used") ev.filterValue = FILTER_VALUES[i % FILTER_VALUES.length];

    events.push(ev);
    sessionSize++;
  }
  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

const ALL_EVENTS = seedEvents();

// ── Helpers ────────────────────────────────────────────────────────────────
const ACTION_META: Record<ActionType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  section_clicked: { label: "Section Clicked", icon: MousePointerClick, color: "#1D4ED8", bg: "#EFF6FF" },
  transcript_opened: { label: "Transcript Opened", icon: BookOpen, color: "#047857", bg: "#F0FDF4" },
  clip_watched: { label: "Clip Watched", icon: Play, color: "#7C3AED", bg: "#F5F3FF" },
  summary_copied: { label: "Summary Copied", icon: Copy, color: "#B45309", bg: "#FFFBEB" },
  key_moment_selected: { label: "Key Moment", icon: Clock, color: "#0891B2", bg: "#ECFEFF" },
  category_filter_used: { label: "Filter Used", icon: Filter, color: "#6D28D9", bg: "#F5F3FF" },
  search_performed: { label: "Search", icon: Search, color: "#475569", bg: "#F1F5F9" },
  page_navigated: { label: "Page Visit", icon: Navigation, color: "#830051", bg: "#FDF2F8" },
};

const NAV_META: Record<NavSource, { label: string; color: string; bg: string }> = {
  chat_prompt: { label: "Chat Prompt", color: "#1D4ED8", bg: "#EFF6FF" },
  manual_click: { label: "Manual Click", color: "#475569", bg: "#F1F5F9" },
  search: { label: "Search", color: "#047857", bg: "#F0FDF4" },
  recommendation: { label: "Recommendation", color: "#7C3AED", bg: "#F5F3FF" },
};

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function countBy<T, K extends string>(arr: T[], fn: (item: T) => K): { key: K; count: number }[] {
  const m: Partial<Record<K, number>> = {};
  for (const item of arr) {
    const k = fn(item);
    m[k] = (m[k] ?? 0) + 1;
  }
  return (Object.entries(m) as [K, number][]).map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}

// ── Sub-components ─────────────────────────────────────────────────────────
function ActionBadge({ type }: { type: ActionType }) {
  const m = ACTION_META[type];
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: m.bg, color: m.color }}>
      <m.icon className="w-3 h-3" />
      {m.label}
    </span>
  );
}

function NavBadge({ src }: { src: NavSource }) {
  const m = NAV_META[src];
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
}

function StatCard({ value, label, icon: Icon, color, bg }: { value: number | string; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }) {
  return (
    <motion.div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className="text-xl" style={{ color: "#1D2B4F" }}>{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </motion.div>
  );
}

function HBarChart({ title, data, color }: { title: string; data: { key: string; count: number }[]; color: string }) {
  const max = data[0]?.count ?? 1;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-sm mb-4" style={{ color: "#1D2B4F" }}>{title}</div>
      <div className="space-y-3">
        {data.map((d, i) => (
          <motion.div key={d.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-700 truncate max-w-[180px]">{d.key}</span>
              <span className="text-gray-500 ml-2">{d.count}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${(d.count / max) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function Frame8Analytics() {
  const [activeTab, setActiveTab] = useState<"log" | "analytics">("log");
  const [actionFilter, setActionFilter] = useState<ActionType | "all">("all");
  const [navFilter, setNavFilter] = useState<NavSource | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  const filtered = useMemo(() => {
    let ev = ALL_EVENTS;
    if (actionFilter !== "all") ev = ev.filter((e) => e.actionType === actionFilter);
    if (navFilter !== "all") ev = ev.filter((e) => e.navSource === navFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      ev = ev.filter((e) => e.sectionName.toLowerCase().includes(q) || e.sessionId.includes(q) || (e.searchTerm ?? "").toLowerCase().includes(q));
    }
    if (sortDir === "asc") ev = [...ev].reverse();
    return ev;
  }, [actionFilter, navFilter, searchQuery, sortDir]);

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Analytics
  const sectionCounts = countBy(ALL_EVENTS, (e) => e.sectionName);
  const actionCounts = countBy(ALL_EVENTS, (e) => ACTION_META[e.actionType].label);
  const navCounts = countBy(ALL_EVENTS, (e) => NAV_META[e.navSource].label);
  const copiedCounts = countBy(ALL_EVENTS.filter((e) => e.actionType === "summary_copied"), (e) => e.sectionName);
  const watchedCounts = countBy(ALL_EVENTS.filter((e) => e.actionType === "clip_watched"), (e) => e.sectionName);

  const chatDriven = ALL_EVENTS.filter((e) => e.navSource === "chat_prompt").length;
  const manualNav = ALL_EVENTS.filter((e) => e.navSource === "manual_click").length;
  const uniqueSessions = new Set(ALL_EVENTS.map((e) => e.sessionId)).size;

  function handleExport() {
    const header = "Timestamp,SessionID,EventTitle,Section,Action,NavSource,Device,OS\n";
    const rows = ALL_EVENTS.map((e) =>
      [e.timestamp, e.sessionId, `"${e.eventTitle}"`, `"${e.sectionName}"`, e.actionType, e.navSource, `"${e.device}"`, e.os].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "engage_os_anonymous_log.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "#F8FAFC" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4" style={{ color: "#830051" }} />
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#FDF2F8", color: "#830051" }}>
              Privacy-First · No PII Stored
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">Anonymous session IDs · Aggregated only</span>
          </div>
          <h2 style={{ color: "#1D2B4F" }}>Event Intelligence Analytics</h2>
          <p className="text-xs text-gray-500 mt-0.5">DDR Bench-to-Bedside Webinar · Engagement log · {ALL_EVENTS.length} events · {uniqueSessions} sessions</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      <div className="px-8 py-5 grid grid-cols-5 gap-4 border-b border-gray-100">
        <StatCard value={ALL_EVENTS.length} label="Total events" icon={BarChart2} color="#1D2B4F" bg="#EFF6FF" />
        <StatCard value={uniqueSessions} label="Anonymous sessions" icon={Hash} color="#830051" bg="#FDF2F8" />
        <StatCard value={chatDriven} label="Chat-driven entries" icon={MessageSquare} color="#1D4ED8" bg="#EFF6FF" />
        <StatCard value={manualNav} label="Manual navigations" icon={MousePointerClick} color="#047857" bg="#F0FDF4" />
        <StatCard value={`${Math.round((chatDriven / ALL_EVENTS.length) * 100)}%`} label="Chat-to-manual ratio" icon={TrendingUp} color="#7C3AED" bg="#F5F3FF" />
      </div>

      {/* Tabs */}
      <div className="px-8 border-b border-gray-200 bg-white flex items-center gap-0">
        {(["log", "analytics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-3 text-sm border-b-2 transition-colors"
            style={
              activeTab === tab
                ? { borderColor: "#830051", color: "#830051" }
                : { borderColor: "transparent", color: "#6B7280" }
            }
          >
            {tab === "log" ? "Event Log" : "Analytics"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "log" && (
          <div className="px-8 py-6">
            {/* Filters */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search section, session ID…"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                  className="pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-indigo-300 w-56"
                />
              </div>

              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value as ActionType | "all"); setPage(0); }}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-indigo-300"
              >
                <option value="all">All action types</option>
                {Object.entries(ACTION_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>

              <select
                value={navFilter}
                onChange={(e) => { setNavFilter(e.target.value as NavSource | "all"); setPage(0); }}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-indigo-300"
              >
                <option value="all">All entry paths</option>
                {Object.entries(NAV_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>

              <span className="text-xs text-gray-400 ml-auto">{filtered.length} events</span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="grid text-xs text-gray-500 px-5 py-3 border-b border-gray-100 bg-gray-50"
                style={{ gridTemplateColumns: "160px 100px 1fr 1.2fr 150px 160px 140px" }}
              >
                <button className="flex items-center gap-1 text-left hover:text-gray-700" onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}>
                  Timestamp {sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
                <span>Session ID</span>
                <span>Section</span>
                <span>Action</span>
                <span>Entry Path</span>
                <span>Device</span>
                <span>OS</span>
              </div>

              {paginated.map((ev, idx) => (
                <motion.div
                  key={ev.id}
                  className="grid px-5 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors items-center"
                  style={{ gridTemplateColumns: "160px 100px 1fr 1.2fr 150px 160px 140px" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <div>
                    <div className="text-xs font-mono text-gray-900">{fmtTime(ev.timestamp)}</div>
                    <div className="text-xs text-gray-400">{fmtDate(ev.timestamp)}</div>
                  </div>
                  <div className="font-mono text-xs text-gray-500 truncate">{ev.sessionId}</div>
                  <div className="text-xs text-gray-700 pr-3 truncate">{ev.sectionName}</div>
                  <div className="flex flex-col gap-1">
                    <ActionBadge type={ev.actionType} />
                    {ev.searchTerm && <span className="text-xs text-gray-400 italic">"{ev.searchTerm}"</span>}
                    {ev.filterValue && <span className="text-xs text-gray-400">Filter: {ev.filterValue}</span>}
                    {ev.durationMs && <span className="text-xs text-gray-400">{Math.round(ev.durationMs / 1000)}s watched</span>}
                  </div>
                  <div><NavBadge src={ev.navSource} /></div>
                  <div className="text-xs text-gray-600 truncate">{ev.device}</div>
                  <div className="text-xs text-gray-500">{ev.os}</div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
                >
                  Prev
                </button>
                <span className="text-xs text-gray-500">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="px-8 py-6 space-y-6">
            {/* Chat vs Manual */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-sm mb-5" style={{ color: "#1D2B4F" }}>Chat-Driven vs Manually Navigated</div>
              <div className="grid grid-cols-4 gap-4">
                {navCounts.map((n, i) => {
                  const pct = Math.round((n.count / ALL_EVENTS.length) * 100);
                  const colors = ["#1D4ED8", "#475569", "#7C3AED", "#047857"];
                  const bgs = ["#EFF6FF", "#F1F5F9", "#F5F3FF", "#F0FDF4"];
                  return (
                    <motion.div key={n.key} className="rounded-xl border border-gray-100 p-4 text-center" style={{ background: bgs[i] }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}>
                      <div className="text-2xl mb-1" style={{ color: colors[i] }}>{pct}%</div>
                      <div className="text-xs text-gray-600">{n.key}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{n.count} events</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-2 gap-5">
              <HBarChart title="Most Viewed Sections" data={sectionCounts} color="#1D2B4F" />
              <HBarChart title="Action Type Breakdown" data={actionCounts} color="#830051" />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <HBarChart title="Most Copied Summaries" data={copiedCounts} color="#B45309" />
              <HBarChart title="Most Watched Clips" data={watchedCounts} color="#7C3AED" />
            </div>

            {/* Privacy Notice */}
            <motion.div
              className="rounded-xl border p-5 flex items-start gap-4"
              style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#16A34A" }}>
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm mb-1" style={{ color: "#14532D" }}>Privacy Compliance Notice</div>
                <p className="text-xs leading-relaxed" style={{ color: "#166534" }}>
                  All engagement data is collected at session level only. No personally identifiable information (PII) is stored or derivable from this log. Session IDs are one-way hashed at ingestion and cannot be reverse-mapped to individual users, devices, or HCP profiles. This dashboard displays aggregated counts only. Raw event data is retained for 90 days and automatically purged. Compliant with AZ Data Governance Policy v4.2 and applicable GDPR/CCPA requirements.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
