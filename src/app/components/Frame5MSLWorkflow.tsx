import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, User, BookOpen, Lock, ArrowRight, Send, Play, ChevronRight, ChevronLeft, ExternalLink } from "lucide-react";
import { DEMO_QUERY, logEvent } from "../lib/activityLog";

interface Frame5Props {
  query?: string;
  onNavigate: () => void;
  onWebinar?: () => void;
  onMedicalAffairs?: (query: string) => void;
}

const DDR_PAPERS = [
  {
    id: "p1",
    title: "DNA Damage Response Kinases as Therapeutic Targets in Oncology: Mechanisms and Clinical Translation",
    authors: "Morrison JC, Helby AK, Ramirez E, et al.",
    journal: "Nature Reviews Cancer",
    year: 2024,
    doi: "10.1038/nrc.2024.0142",
    summary:
      "Comprehensive review of the DDR network covering ATM, ATR, PARP1/2, and WEE1 as druggable nodes. Approximately 40% of solid tumours harbour DDR pathway alterations detectable by NGS. DDR deficiency creates synthetic lethality vulnerabilities — most powerfully with PARP inhibitors in HR-deficient cancers — providing the scientific rationale for biomarker-stratified trial design.",
    accent: "#9333EA",
    bg: "#FEF3FF",
  },
  {
    id: "p2",
    title: "PARP Inhibition in DDR-Deficient NSCLC: Results of a Phase II Biomarker-Selected Study",
    authors: "Watkins JA, Chen S, Okonkwo F, Park Y, et al.",
    journal: "Journal of Clinical Oncology",
    year: 2023,
    doi: "10.1200/JCO.2023.41.16_suppl.9027",
    summary:
      "Phase II study (n=118) in DDR-high NSCLC patients (≥2 DDR gene alterations by ctDNA). PARP inhibitor arm achieved 34% ORR vs 8% in unselected cohort. Grade 3+ haematological events in 12%. Authors recommend DDR biomarker stratification as standard for future IO/DDRi combination trials.",
    accent: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    id: "p3",
    title: "Osimertinib + ATR Inhibition: Preclinical Evidence for Synergy in EGFR-Mutant Models",
    authors: "Liu X, Johansson M, Patel R, Morrison JC, et al.",
    journal: "Cancer Research",
    year: 2024,
    doi: "10.1158/0008-5472.CAN-24-0381",
    summary:
      "In vitro and in vivo data from EGFR-mutant NSCLC models showing synergistic cell death combining osimertinib with ceralasertib (ATR inhibitor). Mechanism: osimertinib induces stalled replication forks; ATR co-inhibition prevents fork restart, triggering DNA catastrophe. Mechanistic basis for the ongoing MANTA platform trial.",
    accent: "#16A34A",
    bg: "#F0FDF4",
  },
];

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  color: string;
  group: "cleared" | "blocked";
}

interface GraphEdge {
  from: string;
  to: string;
  label: string;
  group: "cleared" | "blocked";
}

const DDR_NODES: GraphNode[] = [
  // ── Cleared / accessible ──────────────────────────────────────────────────
  { id: "ddr-hub",    label: "DDR Hub",            x: 210, y: 155, r: 28, color: "#10B981", group: "cleared" },
  { id: "parp",       label: "PARP Inhibition",    x: 318, y: 78,  r: 20, color: "#8B5CF6", group: "cleared" },
  { id: "atr-atm",   label: "ATR / ATM",           x: 318, y: 234, r: 20, color: "#3B82F6", group: "cleared" },
  { id: "hr-def",    label: "HR-Deficient",        x: 412, y: 44,  r: 13, color: "#A78BFA", group: "cleared" },
  { id: "brca",      label: "BRCA1/2",             x: 422, y: 120, r: 12, color: "#7C3AED", group: "cleared" },
  { id: "rep-stress",label: "Replication Stress",  x: 418, y: 192, r: 12, color: "#60A5FA", group: "cleared" },
  { id: "ceral",     label: "Ceralasertib",        x: 406, y: 266, r: 12, color: "#34D399", group: "cleared" },
  { id: "nsclc",     label: "NSCLC",               x: 98,  y: 60,  r: 15, color: "#06B6D4", group: "cleared" },
  { id: "biomarker", label: "Biomarker NGS",       x: 68,  y: 155, r: 13, color: "#F59E0B", group: "cleared" },
  { id: "synthetic", label: "Synth. Lethality",    x: 98,  y: 250, r: 15, color: "#EC4899", group: "cleared" },
  // ── Blocked ───────────────────────────────────────────────────────────────
  { id: "int-trial", label: "Internal Trial Data", x: 210, y: 34,  r: 18, color: "#EF4444", group: "blocked" },
  { id: "pipeline",  label: "Pipeline Intel",      x: 210, y: 276, r: 18, color: "#EF4444", group: "blocked" },
  { id: "msl-deck",  label: "MSL Briefing Deck",   x: 32,  y: 106, r: 16, color: "#DC2626", group: "blocked" },
];

const DDR_EDGES: GraphEdge[] = [
  // Cleared
  { from: "ddr-hub",  to: "parp",       label: "mechanism",    group: "cleared" },
  { from: "ddr-hub",  to: "atr-atm",   label: "kinase arm",   group: "cleared" },
  { from: "ddr-hub",  to: "nsclc",     label: "expressed in", group: "cleared" },
  { from: "ddr-hub",  to: "biomarker", label: "NGS detect",   group: "cleared" },
  { from: "ddr-hub",  to: "synthetic", label: "enables",      group: "cleared" },
  { from: "parp",     to: "hr-def",    label: "requires",     group: "cleared" },
  { from: "parp",     to: "brca",      label: "BRCA target",  group: "cleared" },
  { from: "atr-atm",  to: "rep-stress",label: "prevents",    group: "cleared" },
  { from: "atr-atm",  to: "ceral",     label: "inhibited by", group: "cleared" },
  { from: "nsclc",    to: "biomarker", label: "profiled by",  group: "cleared" },
  // Blocked access attempts
  { from: "ddr-hub",  to: "int-trial", label: "BLOCKED",      group: "blocked" },
  { from: "ddr-hub",  to: "pipeline",  label: "BLOCKED",      group: "blocked" },
  { from: "ddr-hub",  to: "msl-deck",  label: "BLOCKED",      group: "blocked" },
];

function nodeById(id: string) { return DDR_NODES.find((n) => n.id === id)!; }
function mid(x1: number, y1: number, x2: number, y2: number) {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

function FlowParticle({ x1, y1, x2, y2, delay, color }: {
  x1: number; y1: number; x2: number; y2: number; delay: number; color: string;
}) {
  return (
    <motion.circle cx={x1} cy={y1} r={2.5} fill={color}
      animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.4, delay, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
    />
  );
}

function DDRGraphSVG({ blockedPulse, showPapers }: { blockedPulse: boolean; showPapers: boolean }) {
  return (
    <svg viewBox="0 0 440 310" className="w-full h-full" style={{ overflow: "visible" }}>

      {/* ── Edges ── */}
      {DDR_EDGES.map((edge, i) => {
        const from = nodeById(edge.from);
        const to   = nodeById(edge.to);
        if (!from || !to) return null;
        const m         = mid(from.x, from.y, to.x, to.y);
        const isBlocked = edge.group === "blocked";
        return (
          <g key={`e-${i}`}>
            <motion.line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isBlocked ? "#EF4444" : "rgba(255,255,255,0.22)"}
              strokeWidth={isBlocked ? 1.5 : 1.2}
              strokeDasharray={isBlocked ? "5 4" : undefined}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: isBlocked ? (blockedPulse ? 0.85 : 0.25) : 0.75 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
            />
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 + i * 0.05 }}>
              <rect x={m.x - 22} y={m.y - 6.5} width="44" height="12" rx="3"
                fill={isBlocked ? "rgba(239,68,68,0.18)" : "rgba(0,0,0,0.55)"} />
              <text x={m.x} y={m.y + 3} textAnchor="middle"
                fill={isBlocked ? "#FCA5A5" : "rgba(255,255,255,0.72)"} fontSize="5.5">
                {edge.label}
              </text>
            </motion.g>
            {!isBlocked && showPapers && (
              <FlowParticle x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                delay={0.5 + i * 0.1} color="rgba(255,255,255,0.45)" />
            )}
          </g>
        );
      })}

      {/* ── Nodes ── */}
      {DDR_NODES.map((node, i) => {
        const isBlocked = node.group === "blocked";
        return (
          <motion.g key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: isBlocked ? (blockedPulse ? 1 : 0.35) : 1 }}
            transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 180 }}
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          >
            {/* DDR Hub double glow */}
            {node.id === "ddr-hub" && (
              <>
                <motion.circle cx={node.x} cy={node.y} r={node.r + 14} fill="none"
                  stroke={node.color} strokeWidth="1"
                  animate={{ r: [node.r + 10, node.r + 18], opacity: [0.3, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.circle cx={node.x} cy={node.y} r={node.r + 8} fill="none"
                  stroke={node.color} strokeWidth="1.5"
                  animate={{ r: [node.r + 5, node.r + 13], opacity: [0.5, 0.1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                />
              </>
            )}
            {/* Blocked pulsing red glow */}
            {isBlocked && blockedPulse && (
              <>
                <motion.circle cx={node.x} cy={node.y} r={node.r + 14} fill="none"
                  stroke="#EF4444" strokeWidth="1.5"
                  animate={{ r: [node.r + 6, node.r + 18], opacity: [0.7, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.circle cx={node.x} cy={node.y} r={node.r + 7} fill="none"
                  stroke="#EF4444" strokeWidth="2"
                  animate={{ r: [node.r + 3, node.r + 12], opacity: [0.9, 0] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut", delay: 0.25 }}
                />
              </>
            )}
            {/* Outer ring */}
            {node.r >= 14 && (
              <circle cx={node.x} cy={node.y} r={node.r + 5} fill="none"
                stroke={node.color} strokeWidth="1"
                opacity={isBlocked ? (blockedPulse ? 0.7 : 0.2) : 0.3}
              />
            )}
            {/* Main circle */}
            <circle cx={node.x} cy={node.y} r={node.r} fill={node.color} />
            {/* Centre highlight for large cleared nodes */}
            {node.r >= 22 && !isBlocked && (
              <circle cx={node.x} cy={node.y} r={node.r * 0.28} fill="rgba(255,255,255,0.88)" />
            )}
            {/* Lock icon for blocked nodes */}
            {isBlocked && (
              <>
                <rect x={node.x - 5.5} y={node.y - 1.5} width="11" height="8.5" rx="2"
                  fill={blockedPulse ? "white" : "rgba(255,255,255,0.65)"} />
                <path d={`M ${node.x - 3.5} ${node.y - 1.5} A 3.5 4 0 0 1 ${node.x + 3.5} ${node.y - 1.5}`}
                  stroke={blockedPulse ? "white" : "rgba(255,255,255,0.65)"}
                  strokeWidth="2" fill="none" strokeLinecap="round" />
                <circle cx={node.x} cy={node.y + 2.5} r="1.5"
                  fill={blockedPulse ? node.color : "rgba(220,38,38,0.8)"} />
              </>
            )}
            {/* Label */}
            <text
              x={node.x}
              y={node.r >= 16 ? node.y + node.r + 11 : node.y + node.r + 9}
              textAnchor="middle"
              fill={
                isBlocked
                  ? blockedPulse ? "#FCA5A5" : "rgba(252,165,165,0.4)"
                  : "rgba(255,255,255,0.92)"
              }
              fontSize={node.r >= 22 ? "8.5" : node.r >= 14 ? "7.5" : "6.5"}
              fontWeight={node.r >= 20 ? "700" : "400"}
            >
              {node.label}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

export function Frame5MSLWorkflow({ query = "What is DDR?", onNavigate, onWebinar, onMedicalAffairs }: Frame5Props) {
  const [searching, setSearching]       = useState(true);
  const [showPapers, setShowPapers]     = useState(false);
  const [showClose, setShowClose]       = useState(false);
  const [blockedPulse, setBlockedPulse] = useState(false);
  const [graphCollapsed, setGraphCollapsed] = useState(false);

  useEffect(() => {
    logEvent({ portalType: "hcp", action: "query_submit", query, accessResult: "n/a", searchMode: "Deep Search", sourcesReturned: 0 });
    const t1 = setTimeout(() => {
      setSearching(false);
      setShowPapers(true);
      const isDemoQ = query === DEMO_QUERY;
      logEvent({
        portalType: "hcp",
        action: "results_shown",
        query,
        accessResult: isDemoQ ? "gated_registration_required" : "answered_deep_search",
        searchMode: "Deep Search",
        sourcesReturned: isDemoQ ? 0 : DDR_PAPERS.length,
      });
    }, 1000);
    const t2 = setTimeout(() => { setShowClose(true); setBlockedPulse(true); }, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [query]);

  return (
    <div className="h-full flex overflow-hidden relative">

      {/* ── LEFT: Chat ────────────────────────────────────────────────────── */}
      <div className={`${graphCollapsed ? "flex-1" : "w-[46%]"} flex flex-col overflow-hidden bg-[#F5F5F7] border-r border-gray-200 transition-all duration-300`}>

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#1D2B4F" }}>
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: "#1D2B4F" }}>AZ Medical Information Assistant</p>
            <p className="text-[9px] text-gray-500">Published scientific literature only</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 border border-blue-200 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[9px] text-blue-700 font-medium">HCP</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

          {/* User query */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 flex-row-reverse">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-blue-100">
              <User className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-3 py-2.5 max-w-[80%]">
              <p className="text-xs text-white">{query}</p>
            </div>
          </motion.div>

          {/* Searching indicator */}
          <AnimatePresence>
            {searching && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: "#1D2B4F" }}>
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm border border-gray-100 flex items-center gap-2">
                  <motion.div className="flex gap-1" animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}>
                    {[0, 1, 2].map((i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400" />)}
                  </motion.div>
                  <span className="text-[9px] text-gray-400">Searching published literature…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Papers */}
          <AnimatePresence>
            {showPapers && (
              <>
                {query === DEMO_QUERY ? (
                  /* ── Medical Affairs escalation ── */
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: "#1D2B4F" }}>
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 max-w-[90%]">
                      <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm border border-gray-100 mb-2">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          This query involves <strong>post-progression real-world evidence</strong> beyond published trial populations — it requires Medical Affairs input to provide an accurate, compliant response.
                        </p>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-purple-200 shadow-sm">
                        <div className="px-3 pt-2.5 pb-2 bg-purple-50">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: "#830051" }}>
                              <ExternalLink className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-wide text-purple-700">Medical Affairs Referral</span>
                          </div>
                          <p className="text-[10px] font-semibold leading-snug" style={{ color: "#1D2B4F" }}>
                            Post-Progression PD-1 Evidence: Real-World Data Request
                          </p>
                          <p className="text-[8px] text-gray-500 mt-0.5">
                            AstraZeneca Medical Affairs Spain · Oncology Franchise
                          </p>
                        </div>
                        <div className="bg-white px-3 py-2.5">
                          <p className="text-[9px] text-gray-600 leading-relaxed mb-2">
                            The Medical Affairs team can provide a tailored medical response including real-world data, expanded access programmes, and evidence summaries outside the standard published literature.
                          </p>
                          {onMedicalAffairs && (
                            <button
                              onClick={() => onMedicalAffairs(query)}
                              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-semibold text-white transition-opacity hover:opacity-90"
                              style={{ backgroundColor: "#830051" }}
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              Open Medical Affairs Portal
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "#1D2B4F" }}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[80%] shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-700">Found <strong>3 relevant published papers</strong>:</p>
                  </div>
                </motion.div>

                {DDR_PAPERS.map((paper, i) => (
                  <motion.div key={paper.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }} className="flex gap-2">
                    <div className="w-7 flex-shrink-0" />
                    <div className="flex-1 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                      <div className="px-3 pt-2.5 pb-1.5" style={{ backgroundColor: paper.bg }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" style={{ color: paper.accent }} />
                            <span className="text-[8px] font-bold uppercase tracking-wide" style={{ color: paper.accent }}>
                              Paper {i + 1} of 3
                            </span>
                          </div>
                          <span className="text-[7px] px-1 py-0.5 rounded bg-green-100 text-green-700 font-medium">✓ Published</span>
                        </div>
                        <p className="text-[10px] font-semibold leading-snug" style={{ color: "#1D2B4F" }}>{paper.title}</p>
                        <p className="text-[8px] text-gray-500 mt-0.5">
                          {paper.authors} · <em>{paper.journal}</em> · {paper.year}
                        </p>
                      </div>
                      <div className="bg-white px-3 py-2">
                        <p className="text-[9px] text-gray-600 leading-relaxed">{paper.summary}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Webinar recommendation */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "#1D2B4F" }}>
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[92%] shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-700 mb-2">
                      I also found something interesting you might want to check out:
                    </p>
                    {/* Webinar card */}
                    <div className="rounded-xl overflow-hidden border border-indigo-100">
                      {/* Card header */}
                      <div className="px-3 pt-2.5 pb-2 bg-indigo-50">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0">
                              <Play className="w-2.5 h-2.5 text-white fill-white" />
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-wide text-indigo-700">Recorded Webinar</span>
                          </div>
                          <span className="text-[7px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">May 2026</span>
                        </div>
                        <p className="text-[10px] font-semibold leading-snug" style={{ color: "#1D2B4F" }}>
                          DNA Damage Response: From Bench to Bedside — A Clinical Oncology Update
                        </p>
                        <p className="text-[8px] text-gray-500 mt-0.5">
                          Prof. Alan Ashworth · UCSF Helen Diller Cancer Center · 58 min
                        </p>
                      </div>
                      {/* Timestamps */}
                      <div className="bg-white px-3 py-2.5">
                        <p className="text-[8px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Key Moments</p>
                        <div className="space-y-1.5">
                          {[
                            { time: "04:32", label: "DDR pathway overview and druggable targets" },
                            { time: "12:15", label: "PARP inhibitor mechanism and HR-deficiency context" },
                            { time: "24:40", label: "ATR/ATM inhibition and replication stress response" },
                            { time: "38:20", label: "Osimertinib + ATR combination — MANTA trial rationale" },
                            { time: "51:05", label: "Future directions: biomarker-driven trial design" },
                          ].map(({ time, label }) => (
                            <div key={time} className="flex items-center gap-2 group cursor-pointer">
                              <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-semibold flex-shrink-0">
                                {time}
                              </span>
                              <span className="text-[8.5px] text-gray-600 group-hover:text-indigo-700 transition-colors leading-tight">
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                        {onWebinar && (
                          <button
                            onClick={onWebinar}
                            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[9px] font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: "#4F46E5" }}
                          >
                            <Play className="w-2.5 h-2.5 fill-white" />
                            View Intelligence Analysis
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
                  </>
                )}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-2 flex-shrink-0">
          <input disabled placeholder="Ask another question…"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 text-gray-400 cursor-not-allowed" />
          <button disabled
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-200 opacity-40 cursor-not-allowed flex-shrink-0">
            <Send className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <AnimatePresence>
            {showClose && (
              <motion.button initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                onClick={onNavigate}
                className="px-3 py-2 rounded-lg text-white flex items-center gap-1.5 text-[10px] flex-shrink-0"
                style={{ backgroundColor: "#830051" }}>
                View backbone log <ArrowRight className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── RIGHT: DDR Knowledge Graph ────────────────────────────────────── */}
      <motion.div
        animate={{ width: graphCollapsed ? 0 : undefined, flex: graphCollapsed ? "0 0 0px" : "1 1 0%" }}
        transition={{ duration: 0.25 }}
        className="flex flex-col overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #0d1b2a 100%)" }}
      >

        {/* Graph header */}
        <div className="px-5 py-2.5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-white">DDR Knowledge Graph</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: "rgba(131,0,81,0.65)" }}>
              HCP Query Scope
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="text-[8px] text-gray-400">Accessible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="16" height="8">
                <line x1="0" y1="4" x2="16" y2="4" stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.5" strokeDasharray="4 2" />
              </svg>
              <span className="text-[8px] text-gray-400">Cleared path</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-[8px] text-gray-400">Blocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="16" height="8">
                <line x1="0" y1="4" x2="16" y2="4" stroke="#EF4444"
                  strokeWidth="1.5" strokeDasharray="4 2" />
              </svg>
              <span className="text-[8px] text-gray-400">Access denied</span>
            </div>
            <button
              onClick={() => setGraphCollapsed(true)}
              className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              title="Collapse graph"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SVG graph */}
        <div className="flex-1 p-4 overflow-hidden">
          <DDRGraphSVG blockedPulse={blockedPulse} showPapers={showPapers} />
        </div>

      </motion.div>

      {/* Expand button shown when graph is collapsed */}
      {graphCollapsed && (
        <button
          onClick={() => setGraphCollapsed(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors z-10"
          title="Expand knowledge graph"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
