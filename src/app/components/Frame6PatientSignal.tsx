import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronRight, Lock, Building2, User } from "lucide-react";

interface Frame6Props {
  onNavigate: () => void;
}

type Clearance = "cleared" | "conditional" | "restricted" | "prohibited";

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
  prohibitedReason?: string;
}

// ── Medical Affairs logs — reuse Slide 4 trigger codes for same entities ──────
const MA_ENTRIES: LogEntry[] = [
  {
    id: "ma-tagrisso",
    triggerCode: "TRG-A7F29C",
    upward: "EGFR Oncology Platform → Precision Medicine Programme",
    name: "Tagrisso (Osimertinib)",
    color: "#3B82F6",
    activatesDownstream: true,
    downstreamNodes: ["PD-1 Pathway", "DDR Combination", "ADC Novel Combo", "Epigenetics Layer"],
    comments: "3rd-generation EGFR TKI. Central node for post-progression query. Real-world dosing evidence gaps confirmed across 47 MSL interactions this quarter. Phase III LAURA data relevant.",
    clearance: "cleared",
    clearanceNote: "Full access — Medical Affairs / MSL designation confirmed",
  },
  {
    id: "ma-pd1",
    triggerCode: "TRG-4D81BE",
    upward: "Tagrisso (post-progression context)",
    name: "PD-1 Pathway",
    color: "#F59E0B",
    activatesDownstream: true,
    downstreamNodes: ["Pembrolizumab", "Durvalumab", "Atezolizumab", "Nivolumab", "IO Combination Strategy"],
    comments: "Triggered by query: patient already progressed on PD-1 inhibitor. Pathway activates all 5 checkpoint inhibitor arms. Sequencing evidence from PACIFIC, KEYNOTE-789 retrieved.",
    clearance: "cleared",
    clearanceNote: "Cleared — HCP-verified request; clinical evidence mode active",
  },
  {
    id: "ma-pembro",
    triggerCode: "TRG-C93A15",
    upward: "PD-1 Pathway (checkpoint inhibitor arm)",
    name: "Pembrolizumab",
    color: "#A855F7",
    activatesDownstream: true,
    downstreamNodes: ["IO Combination Strategy"],
    comments: "KEYNOTE-789: pembrolizumab + platinum-pemetrexed post-EGFR TKI. No OS benefit in EGFR-mutant population. Flag: contra-indicated sequencing after osimertinib per current label.",
    clearance: "conditional",
    clearanceNote: "Conditional — sequencing label restriction applies; MLR review required for external use",
  },
  {
    id: "ma-durva",
    triggerCode: "TRG-72EF08",
    upward: "PD-1 Pathway (checkpoint inhibitor arm)",
    name: "Durvalumab",
    color: "#EC4899",
    activatesDownstream: false,
    downstreamNodes: [],
    comments: "PACIFIC regimen context. Durvalumab consolidation post-CRT — separate indication from EGFR-mutant metastatic. No direct downstream activation for this query pathway.",
    clearance: "conditional",
    clearanceNote: "Conditional — indication boundary; not relevant to post-progression EGFR-mutant setting",
  },
  {
    id: "ma-atezo",
    triggerCode: "TRG-1B64D9",
    upward: "PD-1 Pathway (checkpoint inhibitor arm)",
    name: "Atezolizumab",
    color: "#14B8A6",
    activatesDownstream: false,
    downstreamNodes: [],
    comments: "IMpower110/150 data available. Limited evidence in EGFR-mutant subset — consistent with class effect of limited IO benefit post-TKI. No further downstream nodes activated.",
    clearance: "cleared",
    clearanceNote: "Cleared — within scope of comparative landscape data for HCP query",
  },
  {
    id: "ma-nivo",
    triggerCode: "TRG-E05B3F",
    upward: "PD-1 Pathway (checkpoint inhibitor arm)",
    name: "Nivolumab",
    color: "#F97316",
    activatesDownstream: true,
    downstreamNodes: ["IO Combination Strategy"],
    comments: "CheckMate data for NSCLC. EGFR-mutant subgroup: low PD-L1 expression correlates with poor IO response. Nivolumab activates IO Combination node for combination strategy retrieval.",
    clearance: "cleared",
    clearanceNote: "Cleared — comparative scientific data; requester is Medical Affairs professional",
  },
  {
    id: "ma-combo",
    triggerCode: "TRG-9F2C47",
    upward: "PD-1 Pathway + Pembrolizumab + Nivolumab (converging input)",
    name: "IO Combination Strategy",
    color: "#10B981",
    activatesDownstream: false,
    downstreamNodes: [],
    comments: "Convergence node: aggregates real-world combination data across IO agents. Activated by 3 upstream nodes. Summary: combination IO after EGFR TKI — limited evidence, active trial landscape only.",
    clearance: "conditional",
    clearanceNote: "Conditional — combination data is off-label context; approved for internal MSL use only",
  },
];

// ── HCP Query logs (DDR) — new entities, new unique codes ────────────────────
const HCP_ENTRIES: LogEntry[] = [
  {
    id: "hcp-ddr",
    triggerCode: "TRG-B38D71",
    upward: "Oncology Knowledge Base → DDR Scientific Domain",
    name: "DDR — Overview & Mechanisms",
    color: "#10B981",
    activatesDownstream: true,
    downstreamNodes: ["PARP Inhibition", "ATR/ATM Signalling", "Replication Stress"],
    comments: "Published review-level knowledge on the DDR pathway. Covers ATM, ATR, PARP1/2 and WEE1. Approximately 40% of solid tumours carry DDR alterations detectable by NGS. Retrieved from published literature — 3 papers surfaced.",
    clearance: "cleared",
    clearanceNote: "Cleared — published peer-reviewed literature; accessible to HCP tier",
  },
  {
    id: "hcp-parp",
    triggerCode: "TRG-5F9A26",
    upward: "DDR Overview (mechanism arm)",
    name: "PARP Inhibition & Synthetic Lethality",
    color: "#8B5CF6",
    activatesDownstream: true,
    downstreamNodes: ["HR-Deficient Tumour Models", "BRCA1/2 Context"],
    comments: "Published evidence on PARP inhibitor mechanism in HR-deficient cancers. Phase II results showing 34% ORR in DDR-high NSCLC available in published literature. Biomarker-stratified design confirmed.",
    clearance: "cleared",
    clearanceNote: "Cleared — Phase II data is published; returned in response to HCP query",
  },
  {
    id: "hcp-atr",
    triggerCode: "TRG-D4C082",
    upward: "DDR Overview (kinase arm)",
    name: "ATR / ATM Signalling",
    color: "#3B82F6",
    activatesDownstream: true,
    downstreamNodes: ["Ceralasertib (ATR inh)", "Replication Fork Stress"],
    comments: "Published preclinical data on ATR/ATM inhibition and osimertinib combination synergy (Liu et al., Cancer Research 2024). Mechanism: osimertinib induces stalled replication forks; ATR co-inhibition prevents fork restart. Basis for MANTA trial — published.",
    clearance: "cleared",
    clearanceNote: "Cleared — preclinical combination data is published; MANTA trial is public knowledge",
  },
  {
    id: "hcp-webinar",
    triggerCode: "TRG-7E1B59",
    upward: "DDR Scientific Domain → Educational & CME Resources",
    name: "DDR Bench-to-Bedside Webinar (Ashworth, 2026)",
    color: "#6366F1",
    activatesDownstream: true,
    downstreamNodes: ["ATR/ATM Signalling", "PARP Inhibition", "MANTA Trial Context"],
    comments: "Recorded webinar — Prof. Alan Ashworth, UCSF Helen Diller Cancer Center · 58 min · May 2026. Key moments: 04:32 DDR pathway overview; 12:15 PARP inhibitor mechanism; 24:40 ATR/ATM inhibition & replication stress; 38:20 Osimertinib + ATR — MANTA rationale; 51:05 biomarker-driven trial design.",
    clearance: "cleared",
    clearanceNote: "Cleared — publicly available CME content; accessible to HCP tier",
  },
  {
    id: "hcp-trial",
    triggerCode: "TRG-3A6F94",
    upward: "DDR Clinical Evidence → Internal AZ Trial Repository",
    name: "AZ Internal DDR Combination Trial Data",
    color: "#EF4444",
    activatesDownstream: false,
    downstreamNodes: [],
    comments: "Node identified in the AZ Semantic Nervous System — contains interim data from 2 ongoing AZ-sponsored DDR combination trials not yet published. System attempted retrieval; access gate triggered. Data exists in knowledge graph but was not returned to the requester.",
    clearance: "prohibited",
    clearanceNote: "ACCESS BLOCKED — unpublished internal trial data; HCP tier does not have clearance",
    prohibitedReason: "Unpublished / pre-publication trial data. Requires Internal MA or Medical Director clearance.",
  },
  {
    id: "hcp-pipeline",
    triggerCode: "TRG-C2D8E7",
    upward: "DDR Strategic Layer → Pipeline Intelligence",
    name: "DDR Pipeline Strategy & Competitive Intelligence",
    color: "#EF4444",
    activatesDownstream: false,
    downstreamNodes: [],
    comments: "Node identified as connected to the DDR query context. Contains AZ internal pipeline prioritisation, competitive landscape modelling, and undisclosed compound development timelines. Node was found but access was blocked before retrieval.",
    clearance: "prohibited",
    clearanceNote: "ACCESS BLOCKED — confidential pipeline intelligence; restricted to Senior Leadership & BD only",
    prohibitedReason: "Commercial-in-confidence. Competitive intelligence layer. Not accessible to any external party.",
  },
  {
    id: "hcp-msl",
    triggerCode: "TRG-8B5F21",
    upward: "Operational Graph → MSL Briefing Layer",
    name: "Internal MSL DDR Briefing Deck",
    color: "#F59E0B",
    activatesDownstream: false,
    downstreamNodes: [],
    comments: "MSL-facing briefing material on DDR — includes unpublished congress preparation notes, pre-approval narrative framing, and internal talking point guidance. Scientific summary accessible; internal framing layer blocked.",
    clearance: "prohibited",
    clearanceNote: "ACCESS BLOCKED — internal MSL material; scientific summary accessible to HCP, operational context is not",
    prohibitedReason: "Internal MSL briefing content. Scientific summary published; framing layer restricted.",
  },
];

const GRID = "1fr 1.3fr 0.75fr 0.75fr 1.8fr 1.1fr";

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
    cleared:     { Icon: CheckCircle, bg: "bg-green-50",  border: "border-green-300", text: "text-green-800",  label: "CLEARED"     },
    conditional: { Icon: AlertCircle, bg: "bg-amber-50",  border: "border-amber-300", text: "text-amber-800",  label: "CONDITIONAL" },
    restricted:  { Icon: XCircle,     bg: "bg-red-50",    border: "border-red-300",   text: "text-red-800",    label: "RESTRICTED"  },
  }[clearance] ?? { Icon: CheckCircle, bg: "bg-green-50", border: "border-green-300", text: "text-green-800", label: "CLEARED" };
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

function DownstreamCell({ activates, nodes, blocked }: { activates: boolean; nodes: string[]; blocked?: boolean }) {
  const [open, setOpen] = useState(false);
  if (blocked) {
    return (
      <div className="flex items-center gap-1">
        <Lock className="w-3.5 h-3.5 text-red-400" />
        <span className="text-[9px] text-red-400">Blocked</span>
      </div>
    );
  }
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
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-green-700">
        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
        <span className="text-[9px] font-medium">Yes — {nodes.length} node{nodes.length > 1 ? "s" : ""}</span>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-1 space-y-0.5">
            {nodes.map(n => (
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

function LogRow({ entry, expanded, onToggle }: {
  entry: LogEntry; expanded: boolean; onToggle: () => void;
}) {
  const isBlocked = entry.clearance === "prohibited";
  return (
    <div
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
          {entry.prohibitedReason && (
            <span className="text-[8px] text-red-400 italic">· {entry.prohibitedReason}</span>
          )}
        </div>
      )}
      <div className="px-4 py-2.5 grid gap-3 items-start" style={{ gridTemplateColumns: GRID }}>

        {/* ↑ Upward */}
        <div className="flex items-start gap-1.5">
          <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${isBlocked ? "bg-red-100" : "bg-gray-100"}`}>
            <span className={`text-[9px] ${isBlocked ? "text-red-400" : "text-gray-500"}`}>↑</span>
          </div>
          <p className={`text-[9px] leading-relaxed ${isBlocked ? "text-red-700" : "text-gray-600"}`}>{entry.upward}</p>
        </div>

        {/* ◉ Name */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className={`text-[11px] font-semibold ${isBlocked ? "text-red-800" : ""}`}
            style={{ color: isBlocked ? undefined : "#1D2B4F" }}>
            {entry.name}
          </span>
          {isBlocked && <Lock className="w-3 h-3 text-red-400 flex-shrink-0" />}
        </div>

        {/* ↓ Downstream */}
        <DownstreamCell activates={entry.activatesDownstream} nodes={entry.downstreamNodes} blocked={isBlocked} />

        {/* # Trigger Code */}
        <div>
          <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border tracking-wide ${
            isBlocked
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-gray-200 bg-gray-50 text-gray-700"
          }`}>
            {entry.triggerCode}
          </span>
        </div>

        {/* Comments */}
        <p className={`text-[9px] leading-relaxed ${isBlocked ? "text-red-700" : "text-gray-600"} ${expanded ? "" : "line-clamp-2"}`}>
          {entry.comments}
        </p>

        {/* Clearance */}
        <ClearanceBadge clearance={entry.clearance} note={entry.clearanceNote} />
      </div>
    </div>
  );
}

export function Frame6PatientSignal({ onNavigate }: Frame6Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const maClearCount  = MA_ENTRIES.filter(e => e.clearance === "cleared").length;
  const maCondCount   = MA_ENTRIES.filter(e => e.clearance === "conditional").length;
  const hcpClearCount = HCP_ENTRIES.filter(e => e.clearance === "cleared").length;
  const hcpBlockCount = HCP_ENTRIES.filter(e => e.clearance === "prohibited").length;
  const total         = MA_ENTRIES.length + HCP_ENTRIES.length;

  return (
    <div className="h-full bg-[#F5F5F7] flex flex-col overflow-hidden">

      {/* System Header */}
      <div className="bg-[#0F1923] px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#830051" }}>
            <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4">
              <circle cx="10" cy="10" r="3" /><circle cx="10" cy="3" r="1.5" /><circle cx="10" cy="17" r="1.5" />
              <circle cx="3" cy="10" r="1.5" /><circle cx="17" cy="10" r="1.5" />
              <line x1="10" y1="6" x2="10" y2="7" stroke="white" strokeWidth="1" />
              <line x1="10" y1="13" x2="10" y2="14" stroke="white" strokeWidth="1" />
              <line x1="6" y1="10" x2="7" y2="10" stroke="white" strokeWidth="1" />
              <line x1="13" y1="10" x2="14" y2="10" stroke="white" strokeWidth="1" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-semibold tracking-wide">AZ Semantic Nervous System</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#830051] text-white font-mono">COMBINED BACKBONE LOG</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[9px] text-gray-400 font-mono">DATE: 2026-06-04</span>
              <span className="text-gray-600">·</span>
              <span className="text-[9px] text-gray-400 font-mono">{total} total nodes traced across 2 sessions</span>
              <span className="text-gray-600">·</span>
              <motion.span className="text-[9px] text-green-400 font-mono flex items-center gap-1"
                animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />LIVE
              </motion.span>
            </div>
          </div>
        </div>

        {/* Requester badges */}
        <div className="flex items-center gap-3">
          <div className="bg-[#1D2B4F] rounded-xl px-3 py-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#830051" }}>
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-white text-[10px] font-semibold">MSL-001</p>
              <p className="text-[8px] text-green-400 font-mono">MA-VERIFIED · 14:32:07</p>
            </div>
          </div>
          <div className="bg-[#1D2B4F] rounded-xl px-3 py-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-white text-[10px] font-semibold">HCP Session</p>
              <p className="text-[8px] text-blue-400 font-mono">HCP · 15:14:22</p>
            </div>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 grid gap-3 flex-shrink-0"
        style={{ gridTemplateColumns: GRID }}>
        {[
          { icon: "↑", label: "Upward Connection" },
          { icon: "◉", label: "Node Name" },
          { icon: "↓", label: "Activates Downstream?" },
          { icon: "#",  label: "Trigger Code" },
          { icon: "✦", label: "Comments" },
          { icon: "✓", label: "Compliance" },
        ].map(col => (
          <div key={col.label} className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold" style={{ color: "#830051" }}>{col.icon}</span>
            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">{col.label}</span>
          </div>
        ))}
      </div>

      {/* Log rows */}
      <div className="flex-1 overflow-y-auto">

        {/* Medical Affairs section header */}
        <div className="sticky top-0 z-10 px-4 py-1.5 flex items-center gap-3 border-b border-purple-100"
          style={{ backgroundColor: "#F5F0FF" }}>
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wide">Medical Affairs Query</span>
          <span className="text-[9px] text-purple-500 font-mono">SESSION SNS-2026-0604-14:32:07 · MSL-001 (MA-VERIFIED)</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">{maClearCount} cleared</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{maCondCount} conditional</span>
          </div>
        </div>

        {MA_ENTRIES.map(entry => (
          <LogRow
            key={entry.id}
            entry={entry}
            expanded={expanded === entry.id}
            onToggle={() => setExpanded(expanded === entry.id ? null : entry.id)}
          />
        ))}

        {/* HCP Query section header */}
        <div className="sticky top-0 z-10 px-4 py-1.5 flex items-center gap-3 border-b border-blue-100 border-t-2 border-t-blue-200"
          style={{ backgroundColor: "#EFF6FF" }}>
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wide">HCP Query</span>
          <span className="text-[9px] text-blue-500 font-mono">SESSION SNS-2026-0604-15:14:22 · (HCP)</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">{hcpClearCount} cleared</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">{hcpBlockCount} blocked</span>
          </div>
        </div>

        <div className="px-4 py-2 bg-red-950 border-b border-red-800 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          <p className="text-[9px] text-red-300">
            <span className="font-semibold text-red-200">Access enforcement active —</span> {hcpBlockCount} nodes identified but blocked at retrieval. Logged below, not returned to requester.
          </p>
        </div>

        {HCP_ENTRIES.map(entry => (
          <LogRow
            key={entry.id}
            entry={entry}
            expanded={expanded === entry.id}
            onToggle={() => setExpanded(expanded === entry.id ? null : entry.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[9px] text-gray-500 font-mono">LOG COMPLETE · {total} nodes · 2 sessions</span>
          <span className="text-[9px] text-gray-400">·</span>
          <span className="text-[9px] text-purple-600 font-medium">MA: {maClearCount} cleared, {maCondCount} conditional</span>
          <span className="text-[9px] text-gray-400">·</span>
          <span className="text-[9px] text-blue-600 font-medium">HCP: {hcpClearCount} cleared, {hcpBlockCount} blocked</span>
        </div>
        <button onClick={onNavigate}
          className="px-5 py-2 rounded-lg text-white flex items-center gap-2 text-xs flex-shrink-0"
          style={{ backgroundColor: "#830051" }}>
          Move on to Events Engagement
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
