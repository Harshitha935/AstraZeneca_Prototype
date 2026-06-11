import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronRight, Lock, Database } from "lucide-react";
import { getLog, subscribe, LogEntry, PortalType } from "../lib/activityLog";

interface Frame6Props {
  onNavigate: () => void;
}

type Clearance = "cleared" | "conditional" | "restricted" | "prohibited";

interface RowData {
  id: string;
  triggerCode: string;
  upward: string;
  name: string;
  color: string;
  downstreamNodes: string[];
  downstreamBlockedNodes: string[];
  comments: string;
  clearance: Clearance;
  clearanceNote: string;
  timestamp: string;
}

const PORTAL_META: Record<PortalType, { label: string }> = {
  open:    { label: "Open Portal" },
  student: { label: "Student Portal" },
  hcp:     { label: "HCP Portal" },
  patient: { label: "Patient Portal" },
};

const ACTION_LABEL: Record<string, string> = {
  demo_query_click: "Demo query clicked",
  query_submit:     "Query submitted",
  results_shown:    "Results shown",
  cta_dismiss:      "CTA dismissed",
  copy_answer:      "Answer copied",
};

const GRID = "1fr 1.3fr 0.75fr 0.85fr 1.8fr 1.1fr";

// Knowledge-graph nodes that a chat query can activate in the SNS — mirrors
// the node set traced in Frame3/Frame4's Medical Affairs pathway. The "Node
// Name" column shows whichever of these the query relates to, not the raw
// question text.
interface KGNode {
  name: string;
  color: string;
  keywords: string[];
  upward: string;
  downstream: string[];
  // Nodes always shown as access-blocked when this node is activated —
  // mirrors the 3 internal-only nodes blocked for the HCP in Frame5's
  // DDR knowledge graph (Internal Trial Data, Pipeline Intel, MSL Briefing Deck).
  downstreamBlocked: string[];
}

const KG_NODES: KGNode[] = [
  {
    name: "Tagrisso (Osimertinib)",
    color: "#3B82F6",
    keywords: ["tagrisso", "osimertinib"],
    upward: "EGFR Oncology Platform → Precision Medicine Programme",
    downstream: ["PD-1 Pathway", "DDR Hub", "ADC Combination", "Epigenetics Layer"],
    downstreamBlocked: [],
  },
  {
    name: "PD-1 Pathway",
    color: "#F59E0B",
    keywords: ["pd-1", "pd1", "pd-l1", "checkpoint inhibitor", "immunotherapy"],
    upward: "Tagrisso (post-progression context)",
    downstream: ["Pembrolizumab", "Durvalumab", "Atezolizumab", "Nivolumab", "IO Combination Strategy"],
    downstreamBlocked: [],
  },
  {
    name: "Pembrolizumab",
    color: "#A855F7",
    keywords: ["pembrolizumab", "pembro", "keytruda"],
    upward: "PD-1 Pathway (checkpoint inhibitor arm)",
    downstream: ["IO Combination Strategy"],
    downstreamBlocked: [],
  },
  {
    name: "Durvalumab",
    color: "#EC4899",
    keywords: ["durvalumab", "durva", "imfinzi"],
    upward: "PD-1 Pathway (checkpoint inhibitor arm)",
    downstream: [],
    downstreamBlocked: [],
  },
  {
    name: "Atezolizumab",
    color: "#14B8A6",
    keywords: ["atezolizumab", "atezo", "tecentriq"],
    upward: "PD-1 Pathway (checkpoint inhibitor arm)",
    downstream: [],
    downstreamBlocked: [],
  },
  {
    name: "Nivolumab",
    color: "#F97316",
    keywords: ["nivolumab", "nivo", "opdivo"],
    upward: "PD-1 Pathway (checkpoint inhibitor arm)",
    downstream: ["IO Combination Strategy"],
    downstreamBlocked: [],
  },
  {
    name: "DDR Hub",
    color: "#10B981",
    keywords: ["ddr", "dna damage", "atm", "atr", "parp", "wee1", "ceralasertib", "synthetic lethality"],
    upward: "Tagrisso (combination context)",
    downstream: ["PARP Inhibition", "ATR / ATM", "Biomarker NGS", "Synthetic Lethality"],
    downstreamBlocked: ["Internal Trial Data", "Pipeline Intel", "MSL Briefing Deck"],
  },
  {
    name: "EGFR Mutation Pathway",
    color: "#06B6D4",
    keywords: ["egfr", "exon19", "exon 19", "t790m"],
    upward: "Genomic Biomarker Layer → Precision Oncology",
    downstream: ["Tagrisso (Osimertinib)"],
    downstreamBlocked: [],
  },
  {
    name: "ADC Combination",
    color: "#EF4444",
    keywords: ["adc", "antibody-drug conjugate", "payload"],
    upward: "Tagrisso (novel combination context)",
    downstream: [],
    downstreamBlocked: [],
  },
];

const FALLBACK_NODE: KGNode = {
  name: "General Knowledge Query",
  color: "#6B7280",
  keywords: [],
  upward: "",
  downstream: [],
  downstreamBlocked: [],
};

function detectNode(query: string): KGNode {
  const q = query.toLowerCase();
  return KG_NODES.find((n) => n.keywords.some((k) => q.includes(k))) ?? FALLBACK_NODE;
}

// Deterministic short trigger code derived from the event id, so the same
// event always renders the same code without needing to store one.
function triggerCode(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return `TRG-${hash.toString(16).toUpperCase().padStart(6, "0").slice(-6)}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// Maps a raw cross-portal activity event onto the Medical Affairs
// "backbone log" row shape (upward connection / node / downstream / trigger / comments / clearance).
function toRow(entry: LogEntry): RowData {
  const meta = PORTAL_META[entry.portalType];
  const node = detectNode(entry.query);
  const lineage = node.upward ? `${node.upward} · via ${meta.label}` : `${meta.label} → Knowledge Graph`;

  let comments: string;
  let downstreamNodes: string[] = [];
  let downstreamBlockedNodes: string[] = [];
  let clearance: Clearance = "conditional";
  let clearanceNote = "—";

  if (entry.action === "query_submit") {
    comments = `Query received from ${meta.label}: "${entry.query}". Routed to retrieval engine.`;
    clearanceNote = "Pending — search not yet executed";
  } else if (entry.action === "results_shown") {
    if (entry.accessResult.startsWith("answered")) {
      downstreamNodes = node.downstream.length > 0
        ? node.downstream
        : Array.from({ length: entry.sourcesReturned }, (_, i) => `Published Source ${i + 1}`);
      downstreamBlockedNodes = node.downstreamBlocked;
      comments = `${entry.searchMode} returned ${entry.sourcesReturned} published source${entry.sourcesReturned === 1 ? "" : "s"} for: "${entry.query}".`;
      clearance = "cleared";
      clearanceNote = `Cleared — ${entry.searchMode} accessible to ${meta.label} tier`;
    } else if (entry.accessResult === "gated_registration_required") {
      downstreamBlockedNodes = node.downstream.length > 0 ? node.downstream : node.downstreamBlocked;
      comments = `Access gate triggered for: "${entry.query}". Registration required — results withheld from requester.`;
      clearance = "prohibited";
      clearanceNote = `ACCESS BLOCKED — registration required for ${meta.label} requester`;
    } else if (entry.accessResult === "gated_out_of_scope") {
      comments = `Query flagged as out of scope for ${meta.label}: "${entry.query}". No results returned.`;
      clearance = "restricted";
      clearanceNote = `RESTRICTED — outside ${meta.label} scope`;
    } else {
      comments = `Results processed for: "${entry.query}".`;
    }
  } else if (entry.action === "copy_answer") {
    comments = `User copied the synthesised answer for: "${entry.query}".`;
    clearance = "cleared";
    clearanceNote = `Cleared — answer export permitted for ${meta.label} tier`;
  } else if (entry.action === "cta_dismiss") {
    comments = `Registration prompt dismissed for: "${entry.query}".`;
    clearanceNote = "Conditional — CTA dismissed, no further action";
  } else {
    comments = `${ACTION_LABEL[entry.action] ?? entry.action} for: "${entry.query}".`;
    clearanceNote = "Conditional — query staged, awaiting submission";
  }

  return {
    id: entry.id,
    triggerCode: triggerCode(entry.id),
    upward: lineage,
    name: node.name,
    color: node.color,
    downstreamNodes,
    downstreamBlockedNodes,
    comments,
    clearance,
    clearanceNote,
    timestamp: entry.timestamp,
  };
}

function ClearanceBadge({ clearance, note }: { clearance: Clearance; note: string }) {
  if (clearance === "prohibited") {
    return (
      <div className="rounded-lg border px-2 py-1.5 bg-red-50 border-red-300">
        <div className="flex items-center gap-1 mb-0.5">
          <Lock className="w-3 h-3 text-red-600" />
          <span className="text-[9px] font-bold tracking-wide text-red-700">BLOCKED</span>
        </div>
        <p className="text-[8px] leading-tight text-red-600 opacity-90">{note}</p>
      </div>
    );
  }
  const config = {
    cleared:     { Icon: CheckCircle, bg: "bg-green-50", border: "border-green-300", text: "text-green-800", label: "CLEARED"     },
    conditional: { Icon: AlertCircle, bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-800", label: "CONDITIONAL" },
    restricted:  { Icon: XCircle,     bg: "bg-red-50",   border: "border-red-300",   text: "text-red-800",   label: "RESTRICTED"  },
  }[clearance];
  const { Icon, bg, border, text, label } = config;
  return (
    <div className={`rounded-lg border px-2 py-1.5 ${bg} ${border}`}>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className={`w-3 h-3 ${text}`} />
        <span className={`text-[9px] font-bold tracking-wide ${text}`}>{label}</span>
      </div>
      <p className={`text-[8px] leading-tight ${text} opacity-80`}>{note}</p>
    </div>
  );
}

function DownstreamCell({ activeNodes, blockedNodes }: { activeNodes: string[]; blockedNodes: string[] }) {
  const [open, setOpen] = useState(false);
  const total = activeNodes.length + blockedNodes.length;

  if (total === 0) {
    return (
      <div className="flex items-center gap-1">
        <XCircle className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[9px] text-gray-400">No activation</span>
      </div>
    );
  }

  const SummaryIcon = activeNodes.length > 0 ? CheckCircle : Lock;
  const summaryColor = activeNodes.length > 0 ? "text-green-700" : "text-red-500";
  const summaryIconColor = activeNodes.length > 0 ? "text-green-600" : "text-red-400";

  return (
    <div>
      <button onClick={() => setOpen(o => !o)} className={`flex items-center gap-1 ${summaryColor}`}>
        <SummaryIcon className={`w-3.5 h-3.5 ${summaryIconColor}`} />
        <span className="text-[9px] font-medium">
          {activeNodes.length > 0
            ? `Yes — ${activeNodes.length} node${activeNodes.length > 1 ? "s" : ""}`
            : "Blocked"}
          {blockedNodes.length > 0 ? ` · ${blockedNodes.length} blocked` : ""}
        </span>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-1 space-y-0.5">
            {activeNodes.map(n => (
              <div key={n} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-[8px] text-green-800">{n}</span>
              </div>
            ))}
            {blockedNodes.map(n => (
              <div key={n} className="flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />
                <span className="text-[8px] text-red-500">{n}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LogRow({ row, expanded, onToggle }: { row: RowData; expanded: boolean; onToggle: () => void }) {
  const isBlocked = row.clearance === "prohibited";
  return (
    <motion.div
      initial={{ opacity: 0, backgroundColor: "rgba(131,0,81,0.08)" }}
      animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0)" }}
      transition={{ duration: 0.7 }}
      className={`border-b cursor-pointer transition-colors ${
        isBlocked
          ? expanded ? "bg-red-50 border-red-100" : "bg-[#FFF5F5] border-red-100 hover:bg-red-50"
          : expanded ? "bg-[#F8F4FF] border-gray-100" : "bg-white border-gray-100 hover:bg-gray-50"
      }`}
      onClick={onToggle}
    >
      {isBlocked && (
        <div className="px-4 pt-1.5 pb-0 flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-red-500" />
          <span className="text-[8px] font-bold text-red-600 uppercase tracking-wide">Node Identified — Access Blocked</span>
        </div>
      )}
      <div className="px-4 py-2.5 grid gap-3 items-start" style={{ gridTemplateColumns: GRID }}>

        {/* ↑ Upward */}
        <div className="flex items-start gap-1.5">
          <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${isBlocked ? "bg-red-100" : "bg-gray-100"}`}>
            <span className={`text-[9px] ${isBlocked ? "text-red-400" : "text-gray-500"}`}>↑</span>
          </div>
          <p className={`text-[9px] leading-relaxed ${isBlocked ? "text-red-700" : "text-gray-600"}`}>{row.upward}</p>
        </div>

        {/* ◉ Name */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
          <span className={`text-[10.5px] font-semibold truncate ${isBlocked ? "text-red-800" : ""}`}
            style={{ color: isBlocked ? undefined : "#1D2B4F" }} title={row.name}>
            {row.name}
          </span>
          {isBlocked && <Lock className="w-3 h-3 text-red-400 flex-shrink-0" />}
        </div>

        {/* ↓ Downstream */}
        <DownstreamCell activeNodes={row.downstreamNodes} blockedNodes={row.downstreamBlockedNodes} />

        {/* # Trigger Code */}
        <div>
          <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border tracking-wide ${
            isBlocked ? "border-red-200 bg-red-50 text-red-600" : "border-gray-200 bg-gray-50 text-gray-700"
          }`}>
            {row.triggerCode}
          </span>
          <p className="text-[7px] text-gray-400 font-mono mt-1">{formatTime(row.timestamp)}</p>
        </div>

        {/* Comments */}
        <p className={`text-[9px] leading-relaxed ${isBlocked ? "text-red-700" : "text-gray-600"} ${expanded ? "" : "line-clamp-2"}`}>
          {row.comments}
        </p>

        {/* Clearance */}
        <ClearanceBadge clearance={row.clearance} note={row.clearanceNote} />
      </div>
    </motion.div>
  );
}

export function Frame6PatientSignal({ onNavigate }: Frame6Props) {
  const [entries, setEntries] = useState<readonly LogEntry[]>(() => getLog());
  const [expanded, setExpanded] = useState<string | null>(null);

  // Reads the shared, cross-portal activity log — unaffected by switching
  // portal mode, so earlier interactions from any portal stay visible.
  useEffect(() => {
    const unsub = subscribe(() => setEntries([...getLog()]));
    return unsub;
  }, []);

  const rows = [...entries].reverse().map(toRow);
  const cleared     = rows.filter(r => r.clearance === "cleared").length;
  const conditional = rows.filter(r => r.clearance === "conditional").length;
  const restricted  = rows.filter(r => r.clearance === "restricted").length;
  const blocked     = rows.filter(r => r.clearance === "prohibited").length;
  const portalsActive = [...new Set(entries.map(e => e.portalType))] as PortalType[];

  return (
    <div className="h-full bg-[#F5F5F7] flex flex-col overflow-hidden">

      {/* System Header */}
      <div className="bg-[#0F1923] px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#830051" }}>
            <Database className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-semibold tracking-wide">AZ Semantic Nervous System</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#830051] text-white font-mono">UNIFIED BACKBONE LOG</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[9px] text-gray-400 font-mono">
                {rows.length} node{rows.length !== 1 ? "s" : ""} traced across {portalsActive.length} portal{portalsActive.length !== 1 ? "s" : ""}
              </span>
              <span className="text-gray-600">·</span>
              <motion.span className="text-[9px] text-green-400 font-mono flex items-center gap-1"
                animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> LIVE
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 grid gap-3 flex-shrink-0" style={{ gridTemplateColumns: GRID }}>
        {[
          { icon: "↑", label: "Upward Connection" },
          { icon: "◉", label: "Node Name" },
          { icon: "↓", label: "Activates Downstream?" },
          { icon: "#", label: "Trigger Code" },
          { icon: "✦", label: "Comments" },
          { icon: "✓", label: "Compliance Clearance" },
        ].map(col => (
          <div key={col.label} className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold" style={{ color: "#830051" }}>{col.icon}</span>
            <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">{col.label}</span>
          </div>
        ))}
      </div>

      {/* Log rows */}
      <div className="flex-1 overflow-y-auto">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Database className="w-8 h-8 mb-3 opacity-20" />
            <p className="text-sm font-medium">No nodes traced yet</p>
            <p className="text-[10px] mt-1">Interact with any portal — Open, Student, HCP, or Patient — to populate this log</p>
          </div>
        ) : (
          rows.map(row => (
            <LogRow
              key={row.id}
              row={row}
              expanded={expanded === row.id}
              onToggle={() => setExpanded(expanded === row.id ? null : row.id)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[9px] text-gray-500 font-mono">LOG · {rows.length} nodes</span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-200">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[9px] text-green-700 font-medium">{cleared} Cleared</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-200">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[9px] text-amber-700 font-medium">{conditional} Conditional</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 border border-red-200">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[9px] text-red-700 font-medium">{restricted} Restricted</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 border border-red-300">
            <Lock className="w-2.5 h-2.5 text-red-600" />
            <span className="text-[9px] text-red-700 font-medium">{blocked} Blocked</span>
          </div>
        </div>
        <button
          onClick={onNavigate}
          className="px-5 py-2 rounded-lg text-white flex items-center gap-2 text-xs flex-shrink-0"
          style={{ backgroundColor: "#830051" }}
        >
          Intelligence Analysis
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
