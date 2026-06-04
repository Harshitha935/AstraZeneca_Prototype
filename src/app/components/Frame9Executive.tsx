import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  Zap,
  GitMerge,
  Layers,
  Target,
  Activity,
  Eye,
  Shield,
} from "lucide-react";

// ── Executive Summary ─────────────────────────────────────────────────────
const EXEC_FINDINGS = [
  {
    type: "opportunity" as const,
    title: "ATR/ATM Inhibition Is the Highest-Signal Emerging Combination",
    body: "The MANTA trial rationale has propagated through both scientific and operational graphs simultaneously — 38% of chat-driven queries in the last 30 days reference osimertinib resistance. This convergence is atypical and warrants prioritised congress content.",
    confidence: 94,
  },
  {
    type: "risk" as const,
    title: "Adverse Event Query Cluster Is Accelerating Without Resolution",
    body: "AE-related node activations are up 41% quarter-on-quarter with no corresponding uptick in resolution rate. MSL briefing decks on AE management have not been refreshed in 18 weeks. Escalation risk is elevated.",
    confidence: 88,
  },
  {
    type: "finding" as const,
    title: "Real-World Evidence Is Underrepresented Relative to Scientific Demand",
    body: "RWE nodes score high on both attribution depth and scientific query frequency, yet congress agenda representation has declined two cycles running. The gap between scientific interest and content supply is at a two-year high.",
    confidence: 91,
  },
  {
    type: "opportunity" as const,
    title: "Biomarker-Driven Eligibility Criteria Are Becoming a Decision Pivot",
    body: "ctDNA and multi-marker eligibility queries have grown 3.2× in 6 weeks, now appearing in both HCP session logs and MSL research requests. A unified briefing asset does not yet exist.",
    confidence: 86,
  },
  {
    type: "risk" as const,
    title: "Pipeline Intelligence Access Restrictions Are Creating Content Pressure",
    body: "Prohibited node attempts (Internal Trial Data, Pipeline Intel, MSL Briefing Deck) have increased 27% month-on-month. Users are not finding adequate cleared alternatives, suggesting a content gap at the boundary of clearance tiers.",
    confidence: 79,
  },
];

// ── Scientific Graph Nodes ─────────────────────────────────────────────────
interface GNode {
  id: string;
  label: string;
  x: number;
  y: number;
  r: number;
  color: string;
  ring?: string;
  activity: "high" | "medium" | "low";
  growing?: boolean;
  attribution?: number;
}

const SCI_NODES: GNode[] = [
  { id: "ddr",   label: "DDR Pathway",          x: 200, y: 140, r: 30, color: "#1D2B4F", ring: "#6366F1", activity: "high",   growing: true,  attribution: 95 },
  { id: "parp",  label: "PARP Inhibition",       x: 100, y: 80,  r: 22, color: "#830051", ring: "#F472B6", activity: "high",   growing: false, attribution: 88 },
  { id: "atr",   label: "ATR/ATM",               x: 310, y: 70,  r: 24, color: "#0891B2", ring: "#67E8F9", activity: "high",   growing: true,  attribution: 91 },
  { id: "rwe",   label: "Real-World Evidence",   x: 340, y: 190, r: 20, color: "#047857",             activity: "medium", growing: true,  attribution: 82 },
  { id: "manta", label: "MANTA Trial",           x: 260, y: 240, r: 18, color: "#7C3AED", ring: "#A78BFA", activity: "high",   growing: true,  attribution: 76 },
  { id: "hrd",   label: "HRD Biomarker",         x: 120, y: 210, r: 18, color: "#B45309",             activity: "medium", growing: false, attribution: 71 },
  { id: "osi",   label: "Osimertinib",           x: 60,  y: 160, r: 20, color: "#1D4ED8",             activity: "medium", growing: false, attribution: 68 },
  { id: "ae",    label: "Adverse Events",        x: 380, y: 130, r: 16, color: "#DC2626", ring: "#FCA5A5", activity: "high",   growing: true,  attribution: 59 },
  { id: "ctdna", label: "ctDNA Monitoring",      x: 180, y: 270, r: 16, color: "#0F766E",             activity: "medium", growing: true,  attribution: 64 },
];

const SCI_EDGES = [
  ["ddr","parp"],["ddr","atr"],["ddr","rwe"],["ddr","ae"],
  ["parp","hrd"],["parp","osi"],["atr","manta"],["atr","ae"],
  ["manta","osi"],["manta","ctdna"],["hrd","ctdna"],["rwe","manta"],
];

// ── Operational Graph Nodes ────────────────────────────────────────────────
const OPS_NODES: GNode[] = [
  { id: "msl",    label: "MSL Engagement",       x: 200, y: 140, r: 28, color: "#1D2B4F", ring: "#818CF8", activity: "high",   growing: false, attribution: 93 },
  { id: "hcp",    label: "HCP Sessions",         x: 100, y: 75,  r: 24, color: "#0891B2", ring: "#67E8F9", activity: "high",   growing: true,  attribution: 87 },
  { id: "chat",   label: "Chat Queries",         x: 320, y: 65,  r: 22, color: "#830051", ring: "#F472B6", activity: "high",   growing: true,  attribution: 89 },
  { id: "cong",   label: "Congress Content",     x: 350, y: 185, r: 18, color: "#B45309",              activity: "medium", growing: false, attribution: 74 },
  { id: "brief",  label: "MSL Briefings",        x: 270, y: 245, r: 18, color: "#047857",              activity: "medium", growing: false, attribution: 70 },
  { id: "escal",  label: "Escalations",          x: 110, y: 215, r: 20, color: "#DC2626", ring: "#FCA5A5", activity: "high",   growing: true,  attribution: 65 },
  { id: "access", label: "Access Requests",      x: 55,  y: 155, r: 16, color: "#7C3AED",              activity: "medium", growing: true,  attribution: 58 },
  { id: "rec",    label: "Recommendations",      x: 180, y: 275, r: 16, color: "#1D4ED8",              activity: "medium", growing: true,  attribution: 61 },
  { id: "block",  label: "Blocked Queries",      x: 385, y: 130, r: 15, color: "#9CA3AF",              activity: "low",    growing: true,  attribution: 42 },
];

const OPS_EDGES = [
  ["msl","hcp"],["msl","chat"],["msl","brief"],["msl","escal"],
  ["hcp","escal"],["hcp","access"],["chat","rec"],["chat","block"],
  ["brief","cong"],["escal","access"],["rec","cong"],["block","escal"],
];

// ── Investigation Cards ────────────────────────────────────────────────────
interface InvCard {
  node: string;
  pattern: string;
  why: string;
  suggestion: string;
  priority: "critical" | "high" | "medium";
}

const SCI_INVESTIGATIONS: InvCard[] = [
  {
    node: "ATR/ATM",
    pattern: "Node activation up 3.2× in 6 weeks; now co-activates with MANTA Trial and Osimertinib nodes in 78% of sessions",
    why: "Signals a knowledge frontier — HCPs and MSLs are ahead of available content. Congress and briefing materials lag by one cycle.",
    suggestion: "Commission ATR/ATM combination rationale briefing. Prioritise for next congress abstract submission.",
    priority: "critical",
  },
  {
    node: "Real-World Evidence",
    pattern: "High attribution depth (82%) but declining congress representation for two consecutive cycles",
    why: "RWE is becoming the primary evidence type HCPs cite when querying second-line treatment decisions. Supply-demand gap is widening.",
    suggestion: "Audit RWE dataset coverage in NSCLC cohort. Identify gaps vs competitor filings for next advisory board.",
    priority: "high",
  },
  {
    node: "Adverse Events",
    pattern: "Fastest-growing node by raw activation count (+41% QoQ); resolution rate has not improved",
    why: "Unresolved AE queries are a regulatory and reputational risk. Escalation pathway appears under-resourced.",
    suggestion: "Review AE briefing deck currency. Initiate 30-day resolution audit across MSL team.",
    priority: "critical",
  },
  {
    node: "ctDNA Monitoring",
    pattern: "Emerging co-activation with MANTA Trial and HRD Biomarker nodes — pattern appeared 4 weeks ago",
    why: "ctDNA is transitioning from research concept to near-term clinical decision support tool. First-mover content advantage available.",
    suggestion: "Fast-track ctDNA explainer asset. Include in next HCP engagement package.",
    priority: "high",
  },
];

const OPS_INVESTIGATIONS: InvCard[] = [
  {
    node: "Escalations",
    pattern: "Escalation node is the fastest-growing operational node (+38% MoM), co-activating with Blocked Queries and Access Requests",
    why: "Systemic escalation growth without resolution suggests a policy or content boundary issue, not individual HCP need. Risk of perception impact.",
    suggestion: "Map all escalation origins to content gap or access tier. Present findings to Medical Affairs leadership within 2 weeks.",
    priority: "critical",
  },
  {
    node: "Chat Queries",
    pattern: "89% attribution depth — highest of any operational node. Chat is now the primary signal-generation channel.",
    why: "The chat interface has become the de facto intent signal. Query clustering here predicts scientific graph activation 2–3 weeks ahead.",
    suggestion: "Implement real-time chat query clustering to feed content pipeline. Treat chat as leading indicator, not lagging log.",
    priority: "high",
  },
  {
    node: "Blocked Queries",
    pattern: "Low attribution but growing (+27% MoM); consistently co-activates with Escalations",
    why: "Users hitting access boundaries without finding cleared alternatives. This is a content mapping failure, not a security success.",
    suggestion: "Audit blocked query topics. For each, identify whether a cleared equivalent exists or needs commissioning.",
    priority: "high",
  },
  {
    node: "Congress Content",
    pattern: "Stagnant node — activation flat for 3 quarters despite growing scientific demand signals upstream",
    why: "Congress content is not being refreshed at the rate the scientific graph is evolving. Risk of HCP-perceived irrelevance.",
    suggestion: "Align congress abstract pipeline to top 5 scientific graph growth nodes. Review submission calendar.",
    priority: "medium",
  },
];

// ── Cross-Graph Data ───────────────────────────────────────────────────────
const SHARED_NODES = [
  { sci: "ATR/ATM", ops: "Chat Queries", overlap: "ATR/ATM queries dominate chat-driven sessions and have highest scientific attribution simultaneously", signal: "critical" as const },
  { sci: "Adverse Events", ops: "Escalations", overlap: "AE scientific node growth is directly correlated with operational escalation rate — same underlying knowledge gap", signal: "critical" as const },
  { sci: "Real-World Evidence", ops: "Congress Content", overlap: "RWE scientific demand is not reflected in congress content operational output — widening gap detected", signal: "high" as const },
  { sci: "ctDNA Monitoring", ops: "Access Requests", overlap: "ctDNA queries are triggering access requests for restricted pipeline materials — cleared content does not yet satisfy intent", signal: "high" as const },
];

const EMERGING_THEMES = [
  "Synthetic lethality in EGFR-mutant NSCLC as a unifying scientific-operational narrative",
  "Biomarker-driven eligibility as the emerging clinical decision pivot",
  "ATR/ATM inhibition transitioning from hypothesis to near-term HCP conversation topic",
  "ctDNA monitoring as the connective tissue between RWE and trial eligibility",
];

const CROSS_RISKS = [
  "AE query acceleration without resolution is the highest near-term risk — spans both graphs",
  "Blocked query growth signals a content coverage failure at access tier boundaries",
  "MSL briefing currency is insufficient to support the pace of scientific graph evolution",
];

const CROSS_OPPS = [
  "First-mover advantage in ATR/ATM combination briefing — 6-week window before competitor congresses",
  "ctDNA monitoring asset: no cleared equivalent exists; demand signal is already in both graphs",
  "Chat-as-leading-indicator: structuring query clustering could give a 2–3 week content pipeline advantage",
];

// ── Graph Component ────────────────────────────────────────────────────────
function MiniGraph({ nodes, edges, animated }: { nodes: GNode[]; edges: string[][]; animated: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative w-full" style={{ height: 300 }}>
      <svg width="100%" height="300" viewBox="0 0 440 310" className="absolute inset-0">
        {/* Edges */}
        {edges.map(([a, b]) => {
          const na = nodes.find((n) => n.id === a);
          const nb = nodes.find((n) => n.id === b);
          if (!na || !nb) return null;
          const active = hovered === a || hovered === b;
          return (
            <line
              key={`${a}-${b}`}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={active ? "#94A3B8" : "#E2E8F0"}
              strokeWidth={active ? 1.5 : 1}
              opacity={active ? 0.9 : 0.5}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, idx) => {
          const isHov = hovered === node.id;
          return (
            <g key={node.id} onMouseEnter={() => setHovered(node.id)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
              {/* Outer ring for high-activity nodes */}
              {node.ring && (
                <circle cx={node.x} cy={node.y} r={node.r + 5} fill="none" stroke={node.ring} strokeWidth={1.5} opacity={0.35} />
              )}
              {/* Growing indicator pulse */}
              {node.growing && animated && (
                <circle cx={node.x} cy={node.y} r={node.r + 8} fill="none" stroke={node.color} strokeWidth={1} opacity={0.2}>
                  <animate attributeName="r" values={`${node.r + 6};${node.r + 14};${node.r + 6}`} dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.25;0;0.25" dur="2.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={node.x} cy={node.y} r={isHov ? node.r + 2 : node.r}
                fill={node.color}
                opacity={isHov ? 1 : 0.9}
                style={{ transition: "r 0.15s" }}
              />
              {/* Attribution arc */}
              {(node.attribution ?? 0) > 75 && (
                <circle cx={node.x} cy={node.y} r={node.r - 3} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
              )}
              <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={node.r > 20 ? 7 : 6} fontWeight="500">
                {node.label.split(" ").slice(0, 2).join(" ")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Node Stat Row ──────────────────────────────────────────────────────────
function NodeStat({ label, value, color, icon: Icon }: { label: string; value: string | number; color: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-xs text-gray-700">
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
        {label}
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: color + "18", color }}>
        {value}
      </span>
    </div>
  );
}

// ── Investigation Card ─────────────────────────────────────────────────────
function InvestigationCard({ card, delay }: { card: InvCard; delay: number }) {
  const [open, setOpen] = useState(false);
  const priorityStyle = {
    critical: { bar: "#DC2626", bg: "#FEF2F2", label: "Critical" },
    high:     { bar: "#B45309", bg: "#FFFBEB", label: "High" },
    medium:   { bar: "#0891B2", bg: "#ECFEFF", label: "Medium" },
  }[card.priority];

  return (
    <motion.div
      className="rounded-lg border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <button
        className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: priorityStyle.bar }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs" style={{ color: "#1D2B4F" }}>{card.node}</span>
            <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: priorityStyle.bg, color: priorityStyle.bar }}>
              {priorityStyle.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{card.pattern}</p>
        </div>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="px-4 pb-4 border-t border-gray-100"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="pt-3 space-y-3">
              <div>
                <div className="text-xs mb-1" style={{ color: "#830051" }}>Why It Matters</div>
                <p className="text-xs text-gray-600 leading-relaxed">{card.why}</p>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: "#047857" }}>Suggested Investigation</div>
                <div className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: "#F0FDF4" }}>
                  <Target className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#047857" }} />
                  <p className="text-xs text-gray-700 leading-relaxed">{card.suggestion}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Graph Panel ────────────────────────────────────────────────────────────
function GraphPanel({
  title,
  subtitle,
  nodes,
  edges,
  topActive,
  topGrowing,
  topDeep,
  topEscalation,
  investigations,
  accentColor,
  delay,
}: {
  title: string;
  subtitle: string;
  nodes: GNode[];
  edges: string[][];
  topActive: string[];
  topGrowing: string[];
  topDeep?: string[];
  topEscalation?: string[];
  investigations: InvCard[];
  accentColor: string;
  delay: number;
}) {
  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {/* Graph Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100" style={{ background: "#F8FAFC" }}>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
            <span className="text-sm" style={{ color: "#1D2B4F" }}>{title}</span>
          </div>
          <p className="text-xs text-gray-400 ml-4">{subtitle}</p>
        </div>

        <div className="px-4 pt-3">
          <MiniGraph nodes={nodes} edges={edges} animated={true} />
        </div>

        {/* Node Stats */}
        <div className="px-5 pb-4 grid grid-cols-2 gap-x-6 gap-y-0 border-t border-gray-100 mt-1 pt-3">
          <div>
            <div className="text-xs text-gray-400 mb-1.5">Most Active</div>
            {topActive.map((n) => (
              <NodeStat key={n} label={n} value="Active" color={accentColor} icon={Activity} />
            ))}
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1.5">Fastest Growing</div>
            {topGrowing.map((n) => (
              <NodeStat key={n} label={n} value="↑ Growing" color="#047857" icon={TrendingUp} />
            ))}
          </div>
          {topDeep && (
            <div className="mt-3 col-span-1">
              <div className="text-xs text-gray-400 mb-1.5">Deepest Attribution</div>
              {topDeep.map((n) => (
                <NodeStat key={n} label={n} value="Deep" color="#7C3AED" icon={Layers} />
              ))}
            </div>
          )}
          {topEscalation && (
            <div className="mt-3 col-span-1">
              <div className="text-xs text-gray-400 mb-1.5">Highest Escalation</div>
              {topEscalation.map((n) => (
                <NodeStat key={n} label={n} value="Escalated" color="#DC2626" icon={AlertTriangle} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Investigation Priorities */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-3.5 h-3.5" style={{ color: accentColor }} />
          <span className="text-xs" style={{ color: "#1D2B4F" }}>Investigation Priorities</span>
          <span className="text-xs text-gray-400">— click to expand</span>
        </div>
        <div className="space-y-2">
          {investigations.map((card, i) => (
            <InvestigationCard key={card.node} card={card} delay={delay + 0.1 + i * 0.06} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export function Frame9Executive() {
  const [expandedFinding, setExpandedFinding] = useState<number | null>(0);

  const findingStyle = {
    opportunity: { icon: Lightbulb, color: "#047857", bg: "#F0FDF4", border: "#BBF7D0", label: "Opportunity" },
    risk:        { icon: AlertTriangle, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", label: "Risk" },
    finding:     { icon: Sparkles, color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", label: "Finding" },
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: "#F8FAFC" }}>
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" style={{ color: "#830051" }} />
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#FDF2F8", color: "#830051" }}>
                Executive Intelligence · AI-Generated
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">Cross-graph synthesis · AZ Engage OS</span>
            </div>
            <h2 style={{ color: "#1D2B4F" }}>Executive Intelligence Report</h2>
          </div>
          <div className="text-xs text-gray-400">04 Jun 2026 · Q2 2026</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ── AI Executive Summary ── */}
        <div className="px-8 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#830051" }} />
            <span className="text-xs text-gray-500">AI Executive Summary — 5 synthesised findings across scientific and operational knowledge graphs</span>
          </div>

          <div className="space-y-2">
            {EXEC_FINDINGS.map((f, idx) => {
              const s = findingStyle[f.type];
              const isOpen = expandedFinding === idx;
              return (
                <motion.div
                  key={idx}
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: isOpen ? s.border : "#E2E8F0", background: isOpen ? s.bg : "white" }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                >
                  <button
                    className="w-full flex items-start gap-4 px-5 py-3.5 text-left"
                    onClick={() => setExpandedFinding(isOpen ? null : idx)}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: s.color }}>
                      <s.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-0.5">
                        <span className="text-sm" style={{ color: "#1D2B4F" }}>{f.title}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: s.color + "18", color: s.color }}>
                          {s.label}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-auto">
                          {f.confidence}% confidence
                        </span>
                      </div>
                      {!isOpen && <p className="text-xs text-gray-500 truncate">{f.body}</p>}
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" /> : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        className="px-5 pb-4 border-t"
                        style={{ borderColor: s.border }}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <p className="text-xs text-gray-700 leading-relaxed pt-3">{f.body}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Two-Column Graphs ── */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Scientific */}
            <GraphPanel
              title="Scientific Knowledge Graph"
              subtitle="DDR pathway · PARP · ATR/ATM · RWE · Biomarkers"
              nodes={SCI_NODES}
              edges={SCI_EDGES}
              topActive={["DDR Pathway", "ATR/ATM", "Adverse Events"]}
              topGrowing={["ATR/ATM", "Real-World Evidence", "ctDNA Monitoring"]}
              topDeep={["DDR Pathway", "ATR/ATM", "PARP Inhibition"]}
              investigations={SCI_INVESTIGATIONS}
              accentColor="#1D2B4F"
              delay={0.2}
            />

            {/* Operational */}
            <GraphPanel
              title="Operational Knowledge Graph"
              subtitle="MSL engagement · HCP sessions · Chat queries · Escalations"
              nodes={OPS_NODES}
              edges={OPS_EDGES}
              topActive={["Chat Queries", "HCP Sessions", "Escalations"]}
              topGrowing={["Chat Queries", "Escalations", "Blocked Queries"]}
              topEscalation={["Escalations", "Blocked Queries", "Access Requests"]}
              investigations={OPS_INVESTIGATIONS}
              accentColor="#830051"
              delay={0.3}
            />
          </div>
        </div>

        {/* ── Cross-Graph Insights ── */}
        <div className="px-8 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <GitMerge className="w-4 h-4" style={{ color: "#1D2B4F" }} />
            <h3 style={{ color: "#1D2B4F" }}>Cross-Graph Insights</h3>
            <span className="text-xs text-gray-400">— where scientific and operational signals converge</span>
          </div>

          <div className="grid grid-cols-3 gap-5 mb-5">
            {/* Emerging Themes */}
            <motion.div className="bg-white rounded-xl border border-gray-200 p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#F5F3FF" }}>
                  <Zap className="w-3.5 h-3.5" style={{ color: "#7C3AED" }} />
                </div>
                <span className="text-xs" style={{ color: "#1D2B4F" }}>Emerging Themes</span>
              </div>
              <div className="space-y-2.5">
                {EMERGING_THEMES.map((t, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#7C3AED" }} />
                    <p className="text-xs text-gray-600 leading-snug">{t}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Risks */}
            <motion.div className="bg-white rounded-xl border border-gray-200 p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#FEF2F2" }}>
                  <Shield className="w-3.5 h-3.5" style={{ color: "#DC2626" }} />
                </div>
                <span className="text-xs" style={{ color: "#1D2B4F" }}>Risks</span>
              </div>
              <div className="space-y-2.5">
                {CROSS_RISKS.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: "#FEF2F2" }}>
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#DC2626" }} />
                    <p className="text-xs leading-snug" style={{ color: "#7F1D1D" }}>{r}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Opportunities */}
            <motion.div className="bg-white rounded-xl border border-gray-200 p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#F0FDF4" }}>
                  <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "#047857" }} />
                </div>
                <span className="text-xs" style={{ color: "#1D2B4F" }}>Opportunities</span>
              </div>
              <div className="space-y-2.5">
                {CROSS_OPPS.map((o, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: "#F0FDF4" }}>
                    <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#047857" }} />
                    <p className="text-xs leading-snug" style={{ color: "#14532D" }}>{o}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Shared Nodes */}
          <motion.div className="bg-white rounded-xl border border-gray-200 p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                <Eye className="w-3.5 h-3.5" style={{ color: "#1D4ED8" }} />
              </div>
              <span className="text-xs" style={{ color: "#1D2B4F" }}>Nodes Appearing in Both Graphs</span>
              <span className="text-xs text-gray-400">— highest cross-graph significance</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SHARED_NODES.map((sn, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-xl border"
                  style={{ borderColor: sn.signal === "critical" ? "#FECACA" : "#E2E8F0", background: sn.signal === "critical" ? "#FEF9F9" : "#FAFAFA" }}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.07 }}
                >
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded text-center" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                      {sn.sci}
                    </span>
                    <div className="flex justify-center">
                      <GitMerge className="w-3 h-3 text-gray-300" />
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded text-center" style={{ background: "#FDF2F8", color: "#830051" }}>
                      {sn.ops}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{sn.overlap}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
