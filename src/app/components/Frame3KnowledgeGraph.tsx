import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Zap } from "lucide-react";

interface Frame3Props {
  onNavigate: () => void;
}

// ── Scientific KG — nodes ────────────────────────────────────────────────────
// Tagrisso is centre-left; PD-1 Pathway is centre-right with 5 treatment arms
const SCI_NODES = [
  // ── background / dimmed nodes ──────────────────────────────────────────────
  { id: "egfr",       label: "EGFR",           x: 100, y: 65,  r: 16, color: "#06B6D4",  group: "bg" },
  { id: "biomarker",  label: "Biomarker",      x: 60,  y: 155, r: 14, color: "#8B5CF6",  group: "bg" },
  { id: "epi",        label: "Epigenetics",    x: 55,  y: 245, r: 13, color: "#06B6D4",  group: "bg" },
  { id: "adc",        label: "ADCs",           x: 165, y: 280, r: 14, color: "#EF4444",  group: "bg" },
  { id: "ddr",        label: "DDR",            x: 215, y: 295, r: 13, color: "#F59E0B",  group: "bg" },
  { id: "t790m",      label: "T790M",          x: 40,  y: 30,  r: 10, color: "#60A5FA",  group: "bg" },
  { id: "exon19",     label: "Exon19",         x: 145, y: 22,  r: 10, color: "#60A5FA",  group: "bg" },
  { id: "methyl",     label: "Methylation",    x: 22,  y: 200, r: 9,  color: "#67E8F9",  group: "bg" },
  { id: "payload",    label: "Payload",        x: 105, y: 295, r: 9,  color: "#F87171",  group: "bg" },
  // ── highlighted path ───────────────────────────────────────────────────────
  { id: "tagrisso",   label: "Tagrisso",       x: 190, y: 155, r: 26, color: "#3B82F6",  group: "hi" },
  { id: "pd1",        label: "PD-1 Pathway",   x: 310, y: 155, r: 22, color: "#F59E0B",  group: "hi" },
  // treatment platforms branching from PD-1
  { id: "pembro",     label: "Pembrolizumab",  x: 390, y: 65,  r: 15, color: "#A855F7",  group: "hi" },
  { id: "durva",      label: "Durvalumab",     x: 415, y: 135, r: 14, color: "#EC4899",  group: "hi" },
  { id: "atezo",      label: "Atezolizumab",   x: 415, y: 200, r: 14, color: "#14B8A6",  group: "hi" },
  { id: "nivo",       label: "Nivolumab",      x: 390, y: 260, r: 14, color: "#F97316",  group: "hi" },
  { id: "combo",      label: "IO Combination", x: 310, y: 270, r: 14, color: "#10B981",  group: "hi" },
];

const SCI_EDGES = [
  // bg edges
  { from: "tagrisso", to: "egfr",      label: "targets",      group: "bg" },
  { from: "tagrisso", to: "biomarker", label: "guided by",    group: "bg" },
  { from: "tagrisso", to: "epi",       label: "influences",   group: "bg" },
  { from: "tagrisso", to: "adc",       label: "novel combo",  group: "bg" },
  { from: "tagrisso", to: "ddr",       label: "combination",  group: "bg" },
  { from: "egfr",     to: "t790m",     label: "mutation",     group: "bg" },
  { from: "egfr",     to: "exon19",    label: "deletion",     group: "bg" },
  { from: "epi",      to: "methyl",    label: "modifies",     group: "bg" },
  { from: "adc",      to: "payload",   label: "carries",      group: "bg" },
  // highlighted path — Tagrisso → PD-1 → treatment platforms
  { from: "tagrisso", to: "pd1",       label: "post-progression", group: "hi" },
  { from: "pd1",      to: "pembro",    label: "checkpoint inh",   group: "hi" },
  { from: "pd1",      to: "durva",     label: "checkpoint inh",   group: "hi" },
  { from: "pd1",      to: "atezo",     label: "checkpoint inh",   group: "hi" },
  { from: "pd1",      to: "nivo",      label: "checkpoint inh",   group: "hi" },
  { from: "pd1",      to: "combo",     label: "IO strategy",      group: "hi" },
  // platform cross-links
  { from: "pembro",   to: "combo",     label: "used in",      group: "hi" },
  { from: "nivo",     to: "combo",     label: "used in",      group: "hi" },
];

// ── Operational KG ────────────────────────────────────────────────────────────
const OP_NODES = [
  { id: "medaff",    label: "Med Affairs",    x: 195, y: 130, r: 22, color: "#1D2B4F", group: "all" },
  { id: "sales",     label: "Sales Intel",   x: 95,  y: 65,  r: 17, color: "#10B981", group: "all" },
  { id: "mkt",       label: "Marketing",     x: 295, y: 65,  r: 17, color: "#3B82F6", group: "all" },
  { id: "ops",       label: "Operations",    x: 330, y: 155, r: 16, color: "#8B5CF6", group: "all" },
  { id: "supply",    label: "Supply Chain",  x: 255, y: 215, r: 16, color: "#F59E0B", group: "all" },
  { id: "msl",       label: "MSL Teams",     x: 110, y: 210, r: 17, color: "#EF4444", group: "all" },
  { id: "territory", label: "Territory",     x: 40,  y: 30,  r: 11, color: "#34D399", group: "all" },
  { id: "kpi",       label: "KPIs",          x: 145, y: 20,  r: 10, color: "#34D399", group: "all" },
  { id: "brand",     label: "Brand",         x: 330, y: 20,  r: 10, color: "#60A5FA", group: "all" },
  { id: "digital",   label: "Digital",       x: 375, y: 95,  r: 10, color: "#60A5FA", group: "all" },
  { id: "process",   label: "Process",       x: 380, y: 175, r: 10, color: "#A78BFA", group: "all" },
  { id: "logistics", label: "Logistics",     x: 290, y: 270, r: 11, color: "#FCD34D", group: "all" },
  { id: "insights",  label: "Field Insights",x: 65,  y: 250, r: 11, color: "#F87171", group: "all" },
];

const OP_EDGES = [
  { from: "medaff", to: "sales",     label: "informs",     group: "all" },
  { from: "medaff", to: "mkt",       label: "supports",    group: "all" },
  { from: "medaff", to: "ops",       label: "enables",     group: "all" },
  { from: "medaff", to: "supply",    label: "coordinates", group: "all" },
  { from: "medaff", to: "msl",       label: "manages",     group: "all" },
  { from: "sales",  to: "territory", label: "covers",      group: "all" },
  { from: "sales",  to: "kpi",       label: "tracks",      group: "all" },
  { from: "mkt",    to: "brand",     label: "builds",      group: "all" },
  { from: "mkt",    to: "digital",   label: "executes",    group: "all" },
  { from: "ops",    to: "process",   label: "optimizes",   group: "all" },
  { from: "supply", to: "logistics", label: "manages",     group: "all" },
  { from: "msl",    to: "insights",  label: "generates",   group: "all" },
  { from: "sales",  to: "mkt",       label: "aligns",      group: "all" },
  { from: "msl",    to: "sales",     label: "supports",    group: "all" },
  { from: "mkt",    to: "ops",       label: "feeds",       group: "all" },
];

type NodeDef = typeof SCI_NODES[number];
type EdgeDef = typeof SCI_EDGES[number];

function nodePos(nodes: NodeDef[], id: string) {
  return nodes.find((n) => n.id === id)!;
}
function midpoint(x1: number, y1: number, x2: number, y2: number) {
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

// ── Animated data-flow particle ───────────────────────────────────────────────
function FlowParticle({ x1, y1, x2, y2, delay, color }: {
  x1: number; y1: number; x2: number; y2: number; delay: number; color: string;
}) {
  return (
    <motion.circle cx={x1} cy={y1} r={3} fill={color}
      animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.4, delay, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
    />
  );
}

// ── Main SVG graph renderer ───────────────────────────────────────────────────
function KnowledgeGraphSVG({
  nodes, edges, delay = 0, highlightMode = false,
}: {
  nodes: NodeDef[];
  edges: EdgeDef[];
  delay?: number;
  highlightMode?: boolean;
}) {
  return (
    <svg viewBox="0 0 440 310" className="w-full h-full" style={{ overflow: "visible" }}>
      {/* ── Edges ── */}
      {edges.map((edge, i) => {
        const from = nodePos(nodes, edge.from);
        const to   = nodePos(nodes, edge.to);
        if (!from || !to) return null;
        const mid  = midpoint(from.x, from.y, to.x, to.y);
        const isHi = highlightMode && edge.group === "hi";
        const isBg = highlightMode && edge.group === "bg";
        return (
          <g key={`e-${i}`}>
            <motion.line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isHi ? "#F59E0B" : "rgba(255,255,255,0.18)"}
              strokeWidth={isHi ? 2.5 : 1.2}
              opacity={isBg ? 0.12 : 1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: isBg ? 0.12 : isHi ? 1 : 0.7 }}
              transition={{ delay: delay + i * 0.04, duration: 0.5 }}
            />
            {/* Edge label — only shown when not dimmed */}
            {!isBg && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + i * 0.04 + 0.4 }}
              >
                <rect x={mid.x - 22} y={mid.y - 7} width="44" height="13" rx="3"
                  fill={isHi ? "rgba(245,158,11,0.2)" : "rgba(0,0,0,0.55)"}
                />
                <text x={mid.x} y={mid.y + 3} textAnchor="middle"
                  fill={isHi ? "#FDE68A" : "rgba(255,255,255,0.7)"} fontSize="6">
                  {edge.label}
                </text>
              </motion.g>
            )}
            {/* Animated particles on highlighted edges */}
            {isHi && (
              <FlowParticle x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                delay={delay + 1 + i * 0.25} color="#FCD34D"
              />
            )}
          </g>
        );
      })}

      {/* ── Nodes ── */}
      {nodes.map((node, i) => {
        const isHi = highlightMode && node.group === "hi";
        const isBg = highlightMode && node.group === "bg";
        return (
          <motion.g key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: isBg ? 0.18 : 1 }}
            transition={{ delay: delay + i * 0.05, type: "spring", stiffness: 180 }}
            style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          >
            {/* Glow rings for highlighted nodes */}
            {isHi && node.id === "tagrisso" && (
              <>
                <motion.circle cx={node.x} cy={node.y} r={node.r + 14} fill="none"
                  stroke={node.color} strokeWidth="1" opacity="0.2"
                  animate={{ r: [node.r + 10, node.r + 18], opacity: [0.3, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.circle cx={node.x} cy={node.y} r={node.r + 8} fill="none"
                  stroke={node.color} strokeWidth="1.5" opacity="0.4"
                  animate={{ r: [node.r + 5, node.r + 12], opacity: [0.5, 0.1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                />
              </>
            )}
            {isHi && node.id === "pd1" && (
              <motion.circle cx={node.x} cy={node.y} r={node.r + 8} fill="none"
                stroke="#F59E0B" strokeWidth="2" opacity="0.5"
                animate={{ r: [node.r + 5, node.r + 13], opacity: [0.6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            {/* Outer ring */}
            {node.r >= 14 && !isBg && (
              <circle cx={node.x} cy={node.y} r={node.r + 5} fill="none"
                stroke={node.color} strokeWidth="1" opacity={isHi ? 0.6 : 0.3}
              />
            )}
            <circle cx={node.x} cy={node.y} r={node.r} fill={node.color}
              opacity={isBg ? 0.3 : 1}
            />
            {node.r >= 18 && (
              <circle cx={node.x} cy={node.y} r={node.r * 0.28} fill="rgba(255,255,255,0.9)" />
            )}
            {/* Label */}
            <text
              x={node.x}
              y={node.r >= 16 ? node.y + node.r + 11 : node.y + node.r + 9}
              textAnchor="middle"
              fill={isBg ? "rgba(255,255,255,0.25)" : isHi ? "white" : "rgba(255,255,255,0.85)"}
              fontSize={node.r >= 20 ? "8.5" : node.r >= 14 ? "7.5" : "6.5"}
              fontWeight={node.r >= 18 ? "700" : "400"}
            >
              {node.label}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}

const sampleQuery =
  "What is the current dosing evidence for Tagrisso in patients who've already progressed on a PD-1 inhibitor? Are there any real-world data studies?";

// ── Main component ────────────────────────────────────────────────────────────
export function Frame3KnowledgeGraph({ onNavigate }: Frame3Props) {
  const [agentPhase, setAgentPhase]     = useState(0);
  const [highlightMode, setHighlightMode] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAgentPhase(1), 800);
    const t2 = setTimeout(() => setAgentPhase(2), 1600);
    const t3 = setTimeout(() => setAgentPhase(3), 2400);
    // Auto-trigger highlight after agents finish loading
    const t4 = setTimeout(() => setHighlightMode(true), 3400);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  const agents = [
    { label: "Scientific Data Agent",   desc: "Querying oncology literature & trial data",          color: "#8B5CF6" },
    { label: "Clinical Evidence Agent", desc: "Retrieving real-world evidence & dosing studies",     color: "#3B82F6" },
    { label: "Operational Data Agent",  desc: "Accessing MSL field insights & sales intelligence",   color: "#10B981" },
  ];

  return (
    <div className="h-full bg-white flex overflow-hidden">
      {/* ── LEFT PANEL ── */}
      <div className="w-[32%] border-r border-gray-200 flex flex-col bg-[#F5F5F7]">
        <div className="border-b border-gray-200 px-5 py-4 bg-white">
          <h3 className="text-sm" style={{ color: "#1D2B4F" }}>Medical Affairs Query</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">AI agents retrieve from both knowledge graphs</p>
        </div>

        {/* Query card */}
        <div className="px-4 pt-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-purple-50 border-2 border-[#830051] rounded-xl p-3"
          >
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "#830051" }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                  <circle cx="11" cy="11" r="6" stroke="white" strokeWidth="2"/>
                  <path d="M16 16l4 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: "#1D2B4F" }}>{sampleQuery}</p>
            </div>
          </motion.div>
        </div>

        {/* Human researcher SVG */}
        <div className="flex-1 relative overflow-hidden px-2 py-1">
          <svg viewBox="0 0 220 330" className="w-full h-full" style={{ overflow: "visible" }}>
            {/* Monitor */}
            <motion.rect x="62" y="155" width="72" height="50" rx="5" fill="#1D2B4F"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }} style={{ transformOrigin: "98px 180px" }} />
            <motion.rect x="67" y="160" width="62" height="38" rx="3" fill="#0F172A"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} />
            {[0,1,2,3].map((i) => (
              <motion.rect key={i} x="71" y={163 + i * 7} width={i === 3 ? 35 : 54} height="4" rx="2"
                fill={i === 0 ? "#830051" : "rgba(255,255,255,0.25)"}
                initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                style={{ transformOrigin: `71px ${163 + i * 7}px` }} />
            ))}
            <motion.rect x="93" y="205" width="10" height="12" rx="2" fill="#374151"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
            <motion.rect x="82" y="215" width="32" height="5" rx="2" fill="#374151"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
            <motion.rect x="30" y="220" width="155" height="8" rx="3" fill="#6B7280"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} />
            {/* Head */}
            <motion.circle cx="98" cy="125" r="18" fill="#F5D0A9"
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }} style={{ transformOrigin: "98px 125px" }} />
            <motion.path d="M82 118 Q85 107 98 105 Q111 107 114 118 Q110 112 98 111 Q86 112 82 118Z"
              fill="#374151" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} />
            <circle cx="93" cy="123" r="2" fill="#1D2B4F" />
            <circle cx="103" cy="123" r="2" fill="#1D2B4F" />
            <motion.path d="M76 145 Q82 140 98 140 Q114 140 120 145 L122 165 Q110 162 98 162 Q86 162 74 165 Z"
              fill="#830051" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} />
            <motion.path d="M76 148 L58 165 L62 175 L80 158Z" fill="#830051"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} />
            <motion.path d="M120 148 L138 160 L134 170 L116 158Z" fill="#830051"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} />
            <motion.ellipse cx="65" cy="175" rx="8" ry="5" fill="#F5D0A9"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
            <motion.ellipse cx="131" cy="169" rx="8" ry="5" fill="#F5D0A9"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} />
            {/* Name badge */}
            <motion.rect x="80" y="238" width="36" height="20" rx="3" fill="white" stroke="#830051" strokeWidth="1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
            <text x="98" y="248" textAnchor="middle" fill="#830051" fontSize="5" fontWeight="700">Dr. Chen</text>
            <text x="98" y="255" textAnchor="middle" fill="#374151" fontSize="4">Med. Affairs</text>

            {/* Agent nodes */}
            {agents.map((agent, i) => {
              const agentX = [38, 108, 178][i];
              const agentY = 295;
              const active = agentPhase > i;
              return (
                <motion.g key={agent.label}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: active ? 1 : 0.3, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.35, type: "spring" }}
                  style={{ transformOrigin: `${agentX}px ${agentY}px` }}
                >
                  <circle cx={agentX} cy={agentY} r="22" fill={agent.color} opacity="0.15" />
                  <circle cx={agentX} cy={agentY} r="16" fill={agent.color} />
                  <rect x={agentX - 6} y={agentY - 7} width="12" height="9" rx="2" fill="white" opacity="0.9" />
                  <circle cx={agentX - 3} cy={agentY - 3} r="1.5" fill={agent.color} />
                  <circle cx={agentX + 3} cy={agentY - 3} r="1.5" fill={agent.color} />
                  <rect x={agentX - 4} y={agentY + 2} width="8" height="3" rx="1" fill="white" opacity="0.9" />
                  <line x1={agentX} y1={agentY - 7} x2={agentX} y2={agentY - 12} stroke="white" strokeWidth="1.5" opacity="0.9" />
                  <circle cx={agentX} cy={agentY - 13} r="1.5" fill="white" opacity="0.9" />
                </motion.g>
              );
            })}

            {/* Lines: researcher → agents */}
            {agents.map((agent, i) => {
              const agentX = [38, 108, 178][i];
              const active = agentPhase > i;
              return (
                <g key={`la-${i}`}>
                  <motion.line x1="98" y1="228" x2={agentX} y2="274"
                    stroke={agent.color} strokeWidth="1.5" strokeDasharray="4 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: active ? 1 : 0, opacity: active ? 0.8 : 0 }}
                    transition={{ delay: 0.9 + i * 0.35, duration: 0.4 }}
                  />
                  {active && (
                    <FlowParticle x1={98} y1={228} x2={agentX} y2={274}
                      delay={1.2 + i * 0.35} color={agent.color} />
                  )}
                </g>
              );
            })}

            {/* Lines: agents → right edge */}
            {agents.map((agent, i) => {
              const agentX = [38, 108, 178][i];
              const active = agentPhase > i;
              return (
                <g key={`lr-${i}`}>
                  <motion.line x1={agentX + 16} y1="295" x2="218" y2={[140, 155, 170][i]}
                    stroke={agent.color} strokeWidth="1.5" strokeDasharray="4 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: active ? 1 : 0, opacity: active ? 0.8 : 0 }}
                    transition={{ delay: 1.3 + i * 0.35, duration: 0.4 }}
                  />
                  {active && (
                    <FlowParticle x1={agentX + 16} y1={295} x2={218} y2={[140, 155, 170][i]}
                      delay={1.5 + i * 0.35} color={agent.color} />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Agent status strip */}
        <div className="border-t border-gray-200 bg-white p-3 space-y-1.5">
          {agents.map((agent, i) => (
            <motion.div key={agent.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: agentPhase > i ? 1 : 0.35, x: 0 }}
              transition={{ delay: 0.8 + i * 0.35 }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: agentPhase > i ? agent.color : "#9CA3AF" }} />
              <div className="min-w-0">
                <p className="text-[9px] truncate" style={{ color: "#1D2B4F" }}>{agent.label}</p>
                {agentPhase > i && (
                  <p className="text-[8px] text-gray-500 truncate">{agent.desc}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-5 py-3 bg-white flex items-center justify-between">
          <div>
            <h3 className="text-sm" style={{ color: "#1D2B4F" }}>Knowledge Base Retrieval</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">Scientific & Operational graphs — all nodes interconnected</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Toggle highlight */}
            <button
              onClick={() => setHighlightMode((h) => !h)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] border transition-all ${
                highlightMode
                  ? "border-amber-400 text-amber-700 bg-amber-50"
                  : "border-gray-300 text-gray-500 bg-white"
              }`}
            >
              <Zap className="w-3 h-3" />
              {highlightMode ? "Tagrisso → PD-1 Focus" : "Show Full Graph"}
            </button>
            <button onClick={onNavigate}
              className="px-4 py-1.5 rounded-lg text-white flex items-center gap-1.5 text-xs"
              style={{ backgroundColor: "#830051" }}>
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scientific KG */}
          <div className="flex-1 relative" style={{ background: highlightMode
            ? "radial-gradient(ellipse at 43% 50%, #1a1025 0%, #0a0a14 100%)"
            : "linear-gradient(135deg, #0f0f1a 0%, #0d1b2a 100%)" }}>
            <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
              <span className="text-[9px] px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: "rgba(131,0,81,0.7)" }}>
                Scientific Knowledge Graph — 9 Oncology Categories
              </span>
              <AnimatePresence>
                {highlightMode && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="text-[9px] px-2 py-1 rounded-full text-amber-900 bg-amber-200"
                  >
                    Tagrisso → PD-1 Pathway highlighted
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="w-full h-full p-2">
              <KnowledgeGraphSVG nodes={SCI_NODES} edges={SCI_EDGES} delay={0.4} highlightMode={highlightMode} />
            </div>
          </div>

          {/* Cross-connection band */}
          <div className="relative bg-gray-900 overflow-visible" style={{ height: "34px" }}>
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 34">
              {[
                { x1: 120, x2: 95,  label: "Clinical-Ops Sync" },
                { x1: 270, x2: 195, label: "Biomarker-Sales" },
                { x1: 420, x2: 330, label: "IO-Marketing Align" },
                { x1: 560, x2: 450, label: "DDR-Supply Bridge" },
                { x1: 680, x2: 600, label: "ADC-MSL Insight" },
              ].map((link, i) => (
                <g key={i}>
                  <motion.line x1={link.x1} y1={0} x2={link.x2} y2={34}
                    stroke="rgba(131,0,81,0.6)" strokeWidth="2" strokeDasharray="5 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 1.5 + i * 0.15, duration: 0.5 }} />
                  <motion.text x={(link.x1 + link.x2) / 2} y={20} textAnchor="middle"
                    fill="rgba(131,0,81,0.9)" fontSize="7"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 2 + i * 0.15 }}>
                    {link.label}
                  </motion.text>
                </g>
              ))}
              <text x="400" y="11" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7">
                ── Inter-Graph Connections ──
              </text>
            </svg>
          </div>

          {/* Operational KG */}
          <div className="flex-1 relative" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f1923 100%)" }}>
            <div className="absolute top-2 left-3 z-10">
              <span className="text-[9px] px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: "rgba(29,43,79,0.7)" }}>
                Operational Knowledge Graph — Sales, Marketing, Ops & Supply Chain
              </span>
            </div>
            <div className="w-full h-full p-2">
              <KnowledgeGraphSVG nodes={OP_NODES} edges={OP_EDGES} delay={0.9} highlightMode={false} />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t border-gray-200 bg-white px-5 py-2 flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <span className="text-[9px] text-gray-600">Primary Node</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
            <span className="text-[9px] text-gray-600">PD-1 Pathway</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span className="text-[9px] text-gray-600">Treatment Platform</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="28" height="8">
              <line x1="0" y1="4" x2="28" y2="4" stroke="#F59E0B" strokeWidth="2" />
            </svg>
            <span className="text-[9px] text-gray-600">Highlighted Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="28" height="8">
              <line x1="0" y1="4" x2="28" y2="4" stroke="#830051" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.8" />
            </svg>
            <span className="text-[9px] text-gray-600">Inter-Graph Link</span>
          </div>
        </div>
      </div>
    </div>
  );
}
