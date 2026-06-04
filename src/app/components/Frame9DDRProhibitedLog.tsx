import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronRight, Lock, RefreshCw } from "lucide-react";

interface Frame9Props {
  onNavigate: () => void;
}

type Clearance = "cleared" | "conditional" | "prohibited";

interface LogEntry {
  id: string;
  upward: string;
  name: string;
  color: string;
  activatesDownstream: boolean;
  downstreamNodes: string[];
  comments: string;
  clearance: Clearance;
  clearanceNote: string;
  prohibitedReason?: string;
}

const LOG_ENTRIES: LogEntry[] = [
  {
    id: "ddr-overview",
    upward: "Oncology Knowledge Base → DDR Scientific Domain",
    name: "DDR — Overview & Mechanisms",
    color: "#10B981",
    activatesDownstream: true,
    downstreamNodes: ["PARP Inhibition", "ATR/ATM Signalling", "Replication Stress"],
    comments:
      "Published review-level knowledge on the DDR pathway. Covers ATM, ATR, PARP1/2 and WEE1. Approximately 40% of solid tumours carry DDR alterations detectable by NGS. Retrieved from published literature — 3 papers surfaced.",
    clearance: "cleared",
    clearanceNote: "Cleared — published peer-reviewed literature; accessible to HCP External tier",
  },
  {
    id: "parp",
    upward: "DDR Overview (mechanism arm)",
    name: "PARP Inhibition & Synthetic Lethality",
    color: "#8B5CF6",
    activatesDownstream: true,
    downstreamNodes: ["HR-Deficient Tumour Models", "BRCA1/2 Context"],
    comments:
      "Published evidence on PARP inhibitor mechanism in HR-deficient cancers. Phase II results showing 34% ORR in DDR-high NSCLC available in published literature. Biomarker-stratified design confirmed. Downstream nodes activated within published scope.",
    clearance: "cleared",
    clearanceNote: "Cleared — Phase II data is published; returned in response to HCP query",
  },
  {
    id: "atr-atm",
    upward: "DDR Overview (kinase arm)",
    name: "ATR / ATM Signalling",
    color: "#3B82F6",
    activatesDownstream: true,
    downstreamNodes: ["Ceralasertib (ATR inh)", "Replication Fork Stress"],
    comments:
      "Published preclinical data on ATR/ATM inhibition and osimertinib combination synergy (Liu et al., Cancer Research 2024). Mechanism: osimertinib induces stalled replication forks; ATR co-inhibition prevents fork restart. Basis for MANTA trial — published.",
    clearance: "cleared",
    clearanceNote: "Cleared — preclinical combination data is published; MANTA trial is public knowledge",
  },
  {
    id: "internal-trial",
    upward: "DDR Clinical Evidence → Internal AZ Trial Repository",
    name: "AZ Internal DDR Combination Trial Data",
    color: "#EF4444",
    activatesDownstream: false,
    downstreamNodes: [],
    comments:
      "Node identified in the AZ Semantic Nervous System — contains interim data from 2 ongoing AZ-sponsored DDR combination trials not yet published. System attempted retrieval; access gate triggered. Data exists in knowledge graph but was not returned to the requester.",
    clearance: "prohibited",
    clearanceNote: "ACCESS BLOCKED — unpublished internal trial data; HCP External tier does not have clearance",
    prohibitedReason: "Unpublished / pre-publication trial data. Requires Internal MA or Medical Director clearance.",
  },
  {
    id: "pipeline",
    upward: "DDR Strategic Layer → Pipeline Intelligence",
    name: "DDR Pipeline Strategy & Competitive Intelligence",
    color: "#EF4444",
    activatesDownstream: false,
    downstreamNodes: [],
    comments:
      "Node identified as connected to the DDR query context. Contains AZ internal pipeline prioritisation, competitive landscape modelling, and undisclosed compound development timelines. Node was found but access was blocked before retrieval.",
    clearance: "prohibited",
    clearanceNote: "ACCESS BLOCKED — confidential pipeline intelligence; restricted to Senior Leadership & BD only",
    prohibitedReason: "Commercial-in-confidence. Competitive intelligence layer. Not accessible to any external party.",
  },
  {
    id: "msl-brief",
    upward: "Operational Graph → MSL Briefing Layer",
    name: "Internal MSL DDR Briefing Deck",
    color: "#F59E0B",
    activatesDownstream: false,
    downstreamNodes: [],
    comments:
      "MSL-facing briefing material on DDR — includes unpublished congress preparation notes, pre-approval narrative framing, and internal talking point guidance. Flagged by the SNS as a boundary node: scientific content visible, internal framing layer blocked.",
    clearance: "prohibited",
    clearanceNote: "ACCESS BLOCKED — internal MSL material; scientific summary accessible to HCP External, operational context is not",
    prohibitedReason: "Internal MSL briefing content. Scientific summary published; framing layer and internal commentary restricted.",
  },
];

const REQUESTER = {
  name: "Dr. James Okafor",
  role: "Oncology Consultant",
  org: "NHS Trust · GMC #4871203",
  badge: "HCP-EXTERNAL",
  badgeColor: "#2563EB",
};

function ClearanceBadge({ clearance, note }: { clearance: Clearance; note: string }) {
  if (clearance === "prohibited") {
    return (
      <div className="rounded-lg border px-2 py-1.5 bg-red-50 border-red-300">
        <div className="flex items-center gap-1 mb-0.5">
          <Lock className="w-3 h-3 text-red-600" />
          <span className="text-[9px] font-bold tracking-wide text-red-700">ACCESS BLOCKED</span>
        </div>
        <p className="text-[8px] leading-tight text-red-600 opacity-90">{note}</p>
      </div>
    );
  }
  if (clearance === "conditional") {
    return (
      <div className="rounded-lg border px-2 py-1.5 bg-amber-50 border-amber-300">
        <div className="flex items-center gap-1 mb-0.5">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          <span className="text-[9px] font-bold tracking-wide text-amber-800">CONDITIONAL</span>
        </div>
        <p className="text-[8px] leading-tight text-amber-800 opacity-80">{note}</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border px-2 py-1.5 bg-green-50 border-green-300">
      <div className="flex items-center gap-1 mb-0.5">
        <CheckCircle className="w-3 h-3 text-green-600" />
        <span className="text-[9px] font-bold tracking-wide text-green-800">CLEARED</span>
      </div>
      <p className="text-[8px] leading-tight text-green-800 opacity-80">{note}</p>
    </div>
  );
}

function DownstreamCell({ activates, nodes }: { activates: boolean; nodes: string[] }) {
  const [open, setOpen] = useState(false);
  if (!activates) {
    return (
      <div className="flex items-center gap-1">
        <XCircle className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[9px] text-gray-400">No activation</span>
      </div>
    );
  }
  return (
    <div>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-green-700">
        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
        <span className="text-[9px] font-medium">Yes — {nodes.length} node{nodes.length > 1 ? "s" : ""}</span>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-1 space-y-0.5">
            {nodes.map((n) => (
              <div key={n} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[8px] text-green-800">{n}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Frame9DDRProhibitedLog({ onNavigate }: Frame9Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const timers = LOG_ENTRIES.map((_, i) =>
      setTimeout(() => setVisibleCount(i + 1), 300 + i * 380)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const cleared    = LOG_ENTRIES.filter((e) => e.clearance === "cleared").length;
  const prohibited = LOG_ENTRIES.filter((e) => e.clearance === "prohibited").length;
  const conditional= LOG_ENTRIES.filter((e) => e.clearance === "conditional").length;

  return (
    <div className="h-full bg-[#F5F5F7] flex flex-col overflow-hidden">

      {/* ── System Header ── */}
      <div className="bg-[#0F1923] px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#830051" }}>
            <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
              <circle cx="10" cy="10" r="3" />
              <circle cx="10" cy="3"  r="1.5" />
              <circle cx="10" cy="17" r="1.5" />
              <circle cx="3"  cy="10" r="1.5" />
              <circle cx="17" cy="10" r="1.5" />
              <line x1="10" y1="6"  x2="10" y2="7"  stroke="white" strokeWidth="1" />
              <line x1="10" y1="13" x2="10" y2="14" stroke="white" strokeWidth="1" />
              <line x1="6"  y1="10" x2="7"  y2="10" stroke="white" strokeWidth="1" />
              <line x1="13" y1="10" x2="14" y2="10" stroke="white" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-semibold tracking-wide">AZ Semantic Nervous System</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#830051] text-white font-mono">BACKBONE LOG</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900 text-red-300 font-mono">CASE 2 — HCP EXTERNAL</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[9px] text-gray-400 font-mono">SESSION: SNS-2026-0604-15:14:22</span>
              <span className="text-[9px] text-gray-500">·</span>
              <span className="text-[9px] text-gray-400 font-mono">QUERY: What is DDR?</span>
              <span className="text-[9px] text-gray-500">·</span>
              <motion.span className="text-[9px] text-green-400 font-mono flex items-center gap-1"
                animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                LIVE
              </motion.span>
            </div>
          </div>
        </div>

        {/* Requester badge */}
        <div className="bg-[#1D2B4F] rounded-xl px-4 py-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#2563EB" }}>
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div>
            <p className="text-white text-[11px] font-semibold">{REQUESTER.name}</p>
            <p className="text-gray-400 text-[9px]">{REQUESTER.role} · {REQUESTER.org}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[8px] text-blue-400 font-mono">{REQUESTER.badge}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Prohibited warning banner ── */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: visibleCount >= 4 ? 1 : 0, height: visibleCount >= 4 ? "auto" : 0 }}
        transition={{ duration: 0.4 }}
        className="bg-red-950 border-b border-red-800 px-6 py-2 flex items-center gap-3 overflow-hidden flex-shrink-0"
      >
        <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
        <p className="text-[10px] text-red-300">
          <span className="font-semibold text-red-200">Access enforcement active —</span> {prohibited} node{prohibited > 1 ? "s" : ""} identified in the knowledge graph
          were <span className="font-semibold">blocked at retrieval</span>. These entries are logged below but were not returned to the requester.
        </p>
      </motion.div>

      {/* ── Column headers ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 grid gap-3 flex-shrink-0"
        style={{ gridTemplateColumns: "1fr 1.4fr 1fr 2fr 1.1fr" }}>
        {[
          { icon: "↑", label: "Immediate Upward Connection" },
          { icon: "◉", label: "Node Name" },
          { icon: "↓", label: "Activates Downstream?" },
          { icon: "✦", label: "Comments" },
          { icon: "✓", label: "Compliance Clearance" },
        ].map((col) => (
          <div key={col.label} className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold" style={{ color: "#830051" }}>{col.icon}</span>
            <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">{col.label}</span>
          </div>
        ))}
      </div>

      {/* ── Log rows ── */}
      <div className="flex-1 overflow-y-auto">
        {LOG_ENTRIES.map((entry, i) => {
          const isVisible  = i < visibleCount;
          const isExpanded = expanded === entry.id;
          const isBlocked  = entry.clearance === "prohibited";

          return (
            <AnimatePresence key={entry.id}>
              {isVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 12, backgroundColor: isBlocked ? "#FEE2E2" : "#FFF9C4" }}
                  animate={{
                    opacity: 1, y: 0,
                    backgroundColor: isBlocked
                      ? (isExpanded ? "#FEF2F2" : "#FFF5F5")
                      : (isExpanded ? "#F8F4FF" : "#FFFFFF"),
                  }}
                  transition={{ duration: 0.4, backgroundColor: { delay: 0.6, duration: 0.8 } }}
                  className={`border-b cursor-pointer transition-colors ${
                    isBlocked ? "border-red-100 hover:bg-red-50" : "border-gray-100 hover:bg-gray-50"
                  }`}
                  onClick={() => setExpanded(isExpanded ? null : entry.id)}
                >
                  {/* Scan-line on new entry */}
                  {i === visibleCount - 1 && (
                    <motion.div
                      style={{ transformOrigin: "left", backgroundColor: isBlocked ? "#EF4444" : entry.color }}
                      className="h-0.5 w-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.35 }}
                    />
                  )}

                  {/* Blocked overlay stripe */}
                  {isBlocked && (
                    <div className="px-4 pt-2 pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Lock className="w-3 h-3 text-red-500" />
                        <span className="text-[9px] font-bold text-red-600 uppercase tracking-wide">
                          Node Identified — Access Blocked
                        </span>
                        {entry.prohibitedReason && (
                          <span className="text-[8px] text-red-400 italic">{entry.prohibitedReason}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="px-4 py-2.5 grid gap-3 items-start"
                    style={{ gridTemplateColumns: "1fr 1.4fr 1fr 2fr 1.1fr" }}>

                    {/* ↑ Upward */}
                    <div className="flex items-start gap-1.5">
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                        isBlocked ? "bg-red-100" : "bg-gray-100"
                      }`}>
                        <span className={`text-[9px] ${isBlocked ? "text-red-400" : "text-gray-500"}`}>↑</span>
                      </div>
                      <p className={`text-[9px] leading-relaxed ${isBlocked ? "text-red-700" : "text-gray-600"}`}>
                        {entry.upward}
                      </p>
                    </div>

                    {/* ◉ Name */}
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color }} />
                      <span className={`text-[11px] font-semibold ${isBlocked ? "text-red-800" : ""}`}
                        style={{ color: isBlocked ? undefined : "#1D2B4F" }}>
                        {entry.name}
                      </span>
                      {isBlocked && <Lock className="w-3 h-3 text-red-400 flex-shrink-0" />}
                    </div>

                    {/* ↓ Downstream */}
                    {isBlocked ? (
                      <div className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-[9px] text-red-400">Blocked</span>
                      </div>
                    ) : (
                      <DownstreamCell activates={entry.activatesDownstream} nodes={entry.downstreamNodes} />
                    )}

                    {/* Comments */}
                    <p className={`text-[9px] leading-relaxed ${
                      isBlocked ? "text-red-700" : "text-gray-600"
                    } ${isExpanded ? "" : "line-clamp-2"}`}>
                      {entry.comments}
                    </p>

                    {/* Compliance */}
                    <ClearanceBadge clearance={entry.clearance} note={entry.clearanceNote} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}

        {/* Loading pulse */}
        {visibleCount < LOG_ENTRIES.length && (
          <div className="px-4 py-3 flex items-center gap-2">
            <motion.div className="flex gap-1"
              animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              ))}
            </motion.div>
            <span className="text-[9px] text-gray-400 font-mono">
              Retrieving node {visibleCount + 1} of {LOG_ENTRIES.length}…
            </span>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <AnimatePresence>
        {visibleCount >= LOG_ENTRIES.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[9px] text-gray-500 font-mono">LOG COMPLETE · {LOG_ENTRIES.length} nodes traced</span>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-200">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[9px] text-green-700 font-medium">{cleared} Cleared</span>
              </div>
              {conditional > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[9px] text-amber-700 font-medium">{conditional} Conditional</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 border border-red-200">
                <Lock className="w-2.5 h-2.5 text-red-500" />
                <span className="text-[9px] text-red-700 font-medium">{prohibited} Blocked</span>
              </div>
              <span className="text-[9px] text-gray-400">·</span>
              <span className="text-[9px] text-gray-500">
                Requester: <span className="font-semibold" style={{ color: "#2563EB" }}>Dr. Okafor — HCP-EXTERNAL</span>
              </span>
            </div>

            <button
              onClick={onNavigate}
              className="px-5 py-2 rounded-lg text-white flex items-center gap-2 text-xs flex-shrink-0"
              style={{ backgroundColor: "#830051" }}
            >
              Back to Start
              <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 8A5 5 0 1 1 8 3" />
                <path d="M8 1l2.5 2L8 5" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
