import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronRight } from "lucide-react";

interface Frame4Props {
  onNavigate: () => void;
}

type Clearance = "cleared" | "conditional" | "restricted";

interface LogEntry {
  id: string;
  triggerCode: string;
  upward: string;
  name: string;
  color: string;
  activatesDownstream: boolean;
  downstreamNodes: string[];
  comments: string;
  clearance: Clearance;
  clearanceNote: string;
}

const LOG_ENTRIES: LogEntry[] = [
  {
    id: "tagrisso",
    triggerCode: "TRG-A7F29C",
    upward: "EGFR Oncology Platform → Precision Medicine Programme",
    name: "Tagrisso (Osimertinib)",
    color: "#3B82F6",
    activatesDownstream: true,
    downstreamNodes: ["PD-1 Pathway", "DDR Combination", "ADC Novel Combo", "Epigenetics Layer"],
    comments:
      "3rd-generation EGFR TKI. Central node for post-progression query. Real-world dosing evidence gaps confirmed across 47 MSL interactions this quarter. Phase III LAURA data relevant.",
    clearance: "cleared",
    clearanceNote: "Full access — Medical Affairs / MSL designation confirmed",
  },
  {
    id: "pd1",
    triggerCode: "TRG-4D81BE",
    upward: "Tagrisso (post-progression context)",
    name: "PD-1 Pathway",
    color: "#F59E0B",
    activatesDownstream: true,
    downstreamNodes: ["Pembrolizumab", "Durvalumab", "Atezolizumab", "Nivolumab", "IO Combination Strategy"],
    comments:
      "Triggered by query: patient already progressed on PD-1 inhibitor. Pathway activates all 5 checkpoint inhibitor arms. Sequencing evidence from PACIFIC, KEYNOTE-789 retrieved.",
    clearance: "cleared",
    clearanceNote: "Cleared — HCP-verified request; clinical evidence mode active",
  },
  {
    id: "pembro",
    triggerCode: "TRG-C93A15",
    upward: "PD-1 Pathway (checkpoint inhibitor arm)",
    name: "Pembrolizumab",
    color: "#A855F7",
    activatesDownstream: true,
    downstreamNodes: ["IO Combination Strategy"],
    comments:
      "KEYNOTE-789: pembrolizumab + platinum-pemetrexed post-EGFR TKI. No OS benefit in EGFR-mutant population. Flag: contra-indicated sequencing after osimertinib per current label.",
    clearance: "conditional",
    clearanceNote: "Conditional — sequencing label restriction applies; MLR review required for external use",
  },
  {
    id: "durva",
    triggerCode: "TRG-72EF08",
    upward: "PD-1 Pathway (checkpoint inhibitor arm)",
    name: "Durvalumab",
    color: "#EC4899",
    activatesDownstream: false,
    downstreamNodes: [],
    comments:
      "PACIFIC regimen context. Durvalumab consolidation post-CRT — separate indication from EGFR-mutant metastatic. No direct downstream activation for this query pathway.",
    clearance: "conditional",
    clearanceNote: "Conditional — indication boundary; not relevant to post-progression EGFR-mutant setting",
  },
  {
    id: "atezo",
    triggerCode: "TRG-1B64D9",
    upward: "PD-1 Pathway (checkpoint inhibitor arm)",
    name: "Atezolizumab",
    color: "#14B8A6",
    activatesDownstream: false,
    downstreamNodes: [],
    comments:
      "IMpower110/150 data available. Limited evidence in EGFR-mutant subset — consistent with class effect of limited IO benefit post-TKI. No further downstream nodes activated.",
    clearance: "cleared",
    clearanceNote: "Cleared — within scope of comparative landscape data for HCP query",
  },
  {
    id: "nivo",
    triggerCode: "TRG-E05B3F",
    upward: "PD-1 Pathway (checkpoint inhibitor arm)",
    name: "Nivolumab",
    color: "#F97316",
    activatesDownstream: true,
    downstreamNodes: ["IO Combination Strategy"],
    comments:
      "CheckMate data for NSCLC. EGFR-mutant subgroup: low PD-L1 expression correlates with poor IO response. Nivolumab activates IO Combination node for combination strategy retrieval.",
    clearance: "cleared",
    clearanceNote: "Cleared — comparative scientific data; requester is Medical Affairs professional",
  },
  {
    id: "combo",
    triggerCode: "TRG-9F2C47",
    upward: "PD-1 Pathway + Pembrolizumab + Nivolumab (converging input)",
    name: "IO Combination Strategy",
    color: "#10B981",
    activatesDownstream: false,
    downstreamNodes: [],
    comments:
      "Convergence node: aggregates real-world combination data across IO agents. Activated by 3 upstream nodes. Summary: combination IO after EGFR TKI — limited evidence, active trial landscape only.",
    clearance: "conditional",
    clearanceNote: "Conditional — combination data is off-label context; approved for internal MSL use only",
  },
];

const REQUESTER = {
  name: "MSL-001",
  role: "Medical Science Liaison",
  org: "AstraZeneca Medical Affairs",
  badge: "MA-VERIFIED",
  footer: "MSL-001 — MA-VERIFIED",
};

function ClearanceBadge({ clearance, note }: { clearance: Clearance; note: string }) {
  const config = {
    cleared:     { icon: CheckCircle, bg: "bg-green-50",  border: "border-green-300", text: "text-green-800",  label: "CLEARED"     },
    conditional: { icon: AlertCircle, bg: "bg-amber-50",  border: "border-amber-300", text: "text-amber-800",  label: "CONDITIONAL" },
    restricted:  { icon: XCircle,     bg: "bg-red-50",    border: "border-red-300",   text: "text-red-800",    label: "RESTRICTED"  },
  }[clearance];
  const Icon = config.icon;
  return (
    <div className={`rounded-lg border px-2 py-1.5 ${config.bg} ${config.border}`}>
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className={`w-3 h-3 ${config.text}`} />
        <span className={`text-[9px] font-bold tracking-wide ${config.text}`}>{config.label}</span>
      </div>
      <p className={`text-[8px] leading-tight ${config.text} opacity-80`}>{note}</p>
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
        <span className="text-[9px] font-medium text-green-700">Yes — {nodes.length} node{nodes.length > 1 ? "s" : ""}</span>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-1 space-y-0.5"
          >
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

export function Frame4GraphAccumulates({ onNavigate }: Frame4Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

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
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[9px] text-gray-400 font-mono">SESSION: SNS-2026-0604-14:32:07</span>
              <span className="text-[9px] text-gray-500">·</span>
              <span className="text-[9px] text-gray-400 font-mono">QUERY: Tagrisso → PD-1 Pathway</span>
              <span className="text-[9px] text-gray-500">·</span>
              <motion.span
                className="text-[9px] text-green-400 font-mono flex items-center gap-1"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                LIVE
              </motion.span>
            </div>
          </div>
        </div>

        {/* Requester badge */}
        <div className="bg-[#1D2B4F] rounded-xl px-4 py-2 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#830051] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div>
            <p className="text-white text-[11px] font-semibold">{REQUESTER.name}</p>
            <p className="text-gray-400 text-[9px]">{REQUESTER.role} · {REQUESTER.org}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[8px] text-green-400 font-mono">{REQUESTER.badge}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Column headers ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 grid gap-3 flex-shrink-0"
        style={{ gridTemplateColumns: "0.9fr 1.3fr 0.75fr 0.9fr 1.8fr 1.1fr" }}>
        {[
          { icon: "↑", label: "Upward Connection" },
          { icon: "◉", label: "Node Name" },
          { icon: "↓", label: "Activates Downstream?" },
          { icon: "#", label: "Trigger Code" },
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
        {LOG_ENTRIES.map((entry) => {
          const isExpanded = expanded === entry.id;
          return (
            <div
              key={entry.id}
              className={`border-b border-gray-100 cursor-pointer transition-colors ${isExpanded ? "bg-[#F8F4FF]" : "bg-white hover:bg-gray-50"}`}
              onClick={() => setExpanded(isExpanded ? null : entry.id)}
            >
              <div className="px-4 py-3 grid gap-3 items-start"
                style={{ gridTemplateColumns: "0.9fr 1.3fr 0.75fr 0.9fr 1.8fr 1.1fr" }}>

                {/* ↑ Upward */}
                <div className="flex items-start gap-1.5">
                  <div className="mt-0.5 w-4 h-4 rounded flex items-center justify-center bg-gray-100 flex-shrink-0">
                    <span className="text-[9px] text-gray-500">↑</span>
                  </div>
                  <p className="text-[9px] text-gray-600 leading-relaxed">{entry.upward}</p>
                </div>

                {/* ◉ Name */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-[11px] font-semibold" style={{ color: "#1D2B4F" }}>{entry.name}</span>
                </div>

                {/* ↓ Downstream */}
                <DownstreamCell activates={entry.activatesDownstream} nodes={entry.downstreamNodes} />

                {/* # Trigger Code */}
                <div>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 tracking-wide">
                    {entry.triggerCode}
                  </span>
                </div>

                {/* Comments */}
                <div>
                  <p className={`text-[9px] text-gray-600 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                    {entry.comments}
                  </p>
                  {!isExpanded && (
                    <span className="text-[8px] text-purple-600 mt-0.5 block">tap to expand</span>
                  )}
                </div>

                {/* Compliance */}
                <ClearanceBadge clearance={entry.clearance} note={entry.clearanceNote} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[9px] text-gray-500 font-mono">LOG COMPLETE · {LOG_ENTRIES.length} nodes traced</span>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-200">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[9px] text-green-700 font-medium">
              {LOG_ENTRIES.filter((e) => e.clearance === "cleared").length} Cleared
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-200">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[9px] text-amber-700 font-medium">
              {LOG_ENTRIES.filter((e) => e.clearance === "conditional").length} Conditional
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 border border-red-200">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[9px] text-red-700 font-medium">
              {LOG_ENTRIES.filter((e) => e.clearance === "restricted").length} Restricted
            </span>
          </div>
          <span className="text-[9px] text-gray-400">·</span>
          <span className="text-[9px] text-gray-500">Requester: <span className="font-semibold" style={{ color: "#830051" }}>MSL-001 — MA-VERIFIED</span></span>
        </div>

        <button
          onClick={onNavigate}
          className="px-5 py-2 rounded-lg text-white flex items-center gap-2 text-xs flex-shrink-0"
          style={{ backgroundColor: "#830051" }}
        >
          Back to Start
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 8A5 5 0 1 1 8 3" />
            <path d="M8 1l2.5 2L8 5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
