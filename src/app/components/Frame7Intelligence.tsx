import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Search,
  Clock,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Lightbulb,
  FlaskConical,
  Users,
  Shield,
  X,
  Copy,
  FileText,
  Tag,
  Mic,
  MapPin,
  Calendar,
  Filter,
} from "lucide-react";

interface Frame7Props {
  onRestart?: () => void;
  onNavigate?: () => void;
}

const WEBINAR_TITLE = "DDR Bench-to-Bedside: From Mechanism to Clinical Impact";
const SPEAKERS = [
  { name: "Prof. Alan Ashworth", role: "Director, UCSF Helen Diller Cancer Center", institution: "UCSF" },
  { name: "Dr. Sarah Chen", role: "Medical Affairs Lead — Oncology", institution: "AstraZeneca" },
];

const TAGS = ["DDR", "PARP Inhibition", "ATR/ATM", "NSCLC", "Osimertinib", "Biomarker-Driven Trials"];

const FILTER_TYPES = ["All", "Clinical Data", "Safety", "Efficacy", "Q&A", "Patient Selection"] as const;
type FilterType = (typeof FILTER_TYPES)[number];

interface TimelineEntry {
  id: string;
  timestamp: string;
  seconds: number;
  topic: string;
  category: FilterType;
  aiSummary: string;
  transcript: string;
  keyDataPoints: string[];
  trials: string[];
  clinicalInsights: string[];
  highlights: string[];
}

const TIMELINE: TimelineEntry[] = [
  {
    id: "t1",
    timestamp: "04:32",
    seconds: 272,
    topic: "DDR Pathway Overview",
    category: "Clinical Data",
    aiSummary: "Comprehensive overview of the DNA damage response network, including PARP, ATR, ATM and their roles in tumour vulnerability.",
    transcript:
      "The DDR pathway is not a single axis — it's an orchestrated network. When we talk about exploiting DDR deficiencies in cancer, we need to think about three key nodes: PARP, which handles single-strand breaks; ATR, which responds to replication stress; and ATM, which coordinates the response to double-strand breaks. In NSCLC specifically, co-mutations in these pathways create synthetic lethality opportunities we are only beginning to understand...",
    keyDataPoints: ["DDR co-mutation rate ~23% in NSCLC", "Three key nodes: PARP, ATR, ATM", "Synthetic lethality framework applies to solid tumours"],
    trials: [],
    clinicalInsights: ["Co-mutation profiling should be standard in advanced NSCLC workup", "Pathway mapping informs combination strategy selection"],
    highlights: ["Synthetic lethality", "NSCLC co-mutation rate 23%", "ATR/ATM/PARP axis"],
  },
  {
    id: "t2",
    timestamp: "12:15",
    seconds: 735,
    topic: "PARP Inhibitor Mechanism of Action",
    category: "Efficacy",
    aiSummary: "Deep mechanistic review of PARP trapping vs catalytic inhibition, with efficacy data stratified by BRCA status and homologous recombination deficiency.",
    transcript:
      "The distinction between PARP trapping and catalytic inhibition is clinically consequential. Olaparib and niraparib trap PARP on DNA at different efficiencies — this correlates directly with efficacy in HRD-positive tumours. What's interesting in the lung setting is that the biomarker landscape is more complex. We're not dealing with germline BRCA rates comparable to ovarian cancer. The question is whether HRD scores, functional assays, or genomic scar signatures give us equivalent predictive value...",
    keyDataPoints: ["PARP trapping efficiency: olaparib > niraparib in HRD+ models", "HRD score ≥42 correlates with PARP sensitivity (SOLO-1 derived)", "Genomic scar signature as alternative to germline BRCA testing"],
    trials: ["SOLO-1", "PRIMA", "PAOLA-1"],
    clinicalInsights: ["HRD testing should precede PARP inhibitor selection", "Genomic scar signatures offer a BRCA-agnostic biomarker path"],
    highlights: ["PARP trapping mechanism", "HRD score threshold ≥42", "Biomarker-agnostic selection emerging"],
  },
  {
    id: "t3",
    timestamp: "24:40",
    seconds: 1480,
    topic: "ATR/ATM Inhibition & Replication Stress",
    category: "Clinical Data",
    aiSummary: "Replication stress as a targetable vulnerability, with ATR inhibitor data in tumours with high replication stress burden. Combination rationale with immune checkpoint.",
    transcript:
      "ATR is the gatekeeper of the replication fork. In tumours with high oncogene expression — KRAS-mutated, MYC-amplified — replication stress is chronic. ATR inhibition in this context is synthetically lethal. What we've seen with ceralasertib is that the combination with olaparib is not just additive — there are synergistic effects in models with ATM loss. The PATRIOT and OLAPARIB+CERALASERTIB data are converging on a story about immune activation downstream of ATR inhibition that we did not predict...",
    keyDataPoints: ["Ceralasertib + olaparib: ORR 36% in ATM-null cohort", "Replication stress score correlates with ATR inhibitor sensitivity", "IFN-γ pathway upregulation post-ATR inhibition — potential IO synergy"],
    trials: ["PATRIOT", "HUDSON", "AMBER"],
    clinicalInsights: ["ATM IHC or next-gen seq should be co-assessed with DDR panel", "IO + ATR inhibitor combinations merit prospective investigation"],
    highlights: ["ATR = replication fork gatekeeper", "Ceralasertib ORR 36% (ATM-null)", "Unexpected IO activation downstream"],
  },
  {
    id: "t4",
    timestamp: "38:20",
    seconds: 2300,
    topic: "Osimertinib + ATR Inhibition — MANTA Trial Rationale",
    category: "Efficacy",
    aiSummary: "Scientific rationale for combining osimertinib with ATR inhibition in EGFR-mutant NSCLC. MANTA trial design, biomarker-driven eligibility, and early signal from dose-escalation.",
    transcript:
      "The MANTA trial was designed around a hypothesis: that acquired resistance to osimertinib involves upregulation of ATR-dependent repair. We see this in patient-derived models — after third-generation EGFR TKI exposure, tumour cells accumulate replication stress and rely on ATR for survival. Adding ceralasertib creates a synthetic lethality in a population that has progressed on osimertinib. The dose-escalation cohort has shown manageable toxicity and two confirmed partial responses in ten evaluable patients — encouraging, not conclusive...",
    keyDataPoints: ["MANTA Phase I/II: osimertinib 80mg + ceralasertib escalating dose", "2/10 confirmed PR in dose-escalation (evaluable population)", "ATR upregulation confirmed in post-progression biopsies in 7/10 patients"],
    trials: ["MANTA", "SAVANNAH"],
    clinicalInsights: ["Post-osimertinib progression biopsy critical for ATR pathway assessment", "MANTA biomarker analysis will define eligible sub-population"],
    highlights: ["Osimertinib resistance → ATR reliance", "MANTA: 2 confirmed PRs (n=10)", "Biopsy at progression is key"],
  },
  {
    id: "t5",
    timestamp: "51:05",
    seconds: 3065,
    topic: "Biomarker-Driven Trial Design & Patient Selection",
    category: "Patient Selection",
    aiSummary: "Framework for biomarker-driven patient selection in DDR-targeted trials. Discusses serial ctDNA, functional HRD assays, and multi-marker eligibility criteria.",
    transcript:
      "We've reached a point in DDR oncology where single-biomarker trial eligibility is insufficient. The biology is too heterogeneous. What we need — and what MANTA is attempting — is a layered biomarker strategy. ctDNA for dynamic monitoring, functional HRD for pathway activity rather than just genomics, and DDR gene panel as the anchor. The question of how we harmonise these across trial sites remains unsolved. But the direction is clear: biomarker-rich, smaller, adaptive trials with early stopping rules based on molecular endpoints...",
    keyDataPoints: ["ctDNA clearance at 6 weeks = early efficacy signal (DDR cohort)", "Multi-marker eligibility: DDR panel + HRD score + ctDNA baseline", "Adaptive trial design with molecular stopping rules under development"],
    trials: ["MANTA", "TALAPRO-3", "NCI-MATCH DDR arm"],
    clinicalInsights: ["Single-biomarker trial eligibility no longer sufficient for DDR trials", "ctDNA integration into trial design is now feasible and cost-effective"],
    highlights: ["Multi-marker eligibility framework", "ctDNA as dynamic monitoring tool", "Adaptive design with molecular stopping rules"],
  },
];

const KEY_MOMENTS = [
  { label: "Synthetic lethality framework", timestamp: "04:32", id: "t1" },
  { label: "HRD score threshold ≥42", timestamp: "12:15", id: "t2" },
  { label: "Ceralasertib ORR in ATM-null", timestamp: "24:40", id: "t3" },
  { label: "MANTA trial early signal", timestamp: "38:20", id: "t4" },
  { label: "Multi-marker biomarker strategy", timestamp: "51:05", id: "t5" },
];

const EXECUTIVE_SUMMARY = [
  {
    icon: Lightbulb,
    color: "#830051",
    bg: "#FDF2F8",
    title: "Key Takeaway",
    text: "ATR inhibition represents the next DDR frontier in EGFR-mutant NSCLC, with osimertinib resistance creating exploitable synthetic lethality via the MANTA combination approach.",
  },
  {
    icon: FlaskConical,
    color: "#1D2B4F",
    bg: "#EFF6FF",
    title: "Evidence Highlight",
    text: "MANTA Phase I/II shows 2/10 confirmed PRs at dose-escalation with manageable toxicity. Post-progression biopsies confirm ATR upregulation in 70% of osimertinib-resistant tumours.",
  },
  {
    icon: Users,
    color: "#047857",
    bg: "#F0FDF4",
    title: "Clinical Implication",
    text: "Biomarker-driven eligibility — DDR gene panel + HRD score + ctDNA baseline — should be incorporated into institutional protocol for second-line EGFR-mutant NSCLC workup.",
  },
  {
    icon: Shield,
    color: "#7C3AED",
    bg: "#F5F3FF",
    title: "Safety Signal",
    text: "Ceralasertib + olaparib combination demonstrates manageable haematological toxicity. Dose modifications in ~30% of patients but no Grade 4 events at recommended Phase II dose.",
  },
];

function VideoPlaceholder({ timestamp, topic }: { timestamp: string; topic: string }) {
  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: "56.25%", background: "#0F172A" }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
          <Play className="w-7 h-7 text-white ml-1" />
        </div>
        <div className="text-center">
          <div className="text-white/80 text-sm">{topic}</div>
          <div className="text-white/40 text-xs mt-1">Jump to {timestamp}</div>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
          DDR Bench-to-Bedside Webinar · May 2026
        </div>
        <div className="absolute bottom-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          REC
        </div>
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: FilterType }) {
  const styles: Record<FilterType, { bg: string; text: string }> = {
    All: { bg: "#F1F5F9", text: "#475569" },
    "Clinical Data": { bg: "#EFF6FF", text: "#1D4ED8" },
    Safety: { bg: "#FEF2F2", text: "#DC2626" },
    Efficacy: { bg: "#F0FDF4", text: "#16A34A" },
    "Q&A": { bg: "#FDF4FF", text: "#9333EA" },
    "Patient Selection": { bg: "#FFF7ED", text: "#C2410C" },
  };
  const s = styles[category] || styles["All"];
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
      {category}
    </span>
  );
}

export function Frame7Intelligence({ onRestart, onNavigate }: Frame7Props) {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFullVideo, setShowFullVideo] = useState(false);

  const filtered = TIMELINE.filter((e) => {
    const matchFilter = activeFilter === "All" || e.category === activeFilter;
    const matchSearch =
      !searchQuery ||
      e.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.aiSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.keyDataPoints.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="h-full flex flex-col relative" style={{ background: "#F8FAFC" }}>
      {/* Event Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#FDF2F8", color: "#830051" }}>
                Event Intelligence
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">Processed by AZ Engage OS</span>
            </div>
            <h2 style={{ color: "#1D2B4F" }} className="mb-3 leading-snug">
              {WEBINAR_TITLE}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> May 2026
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 58 min
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> UCSF Helen Diller Cancer Center
              </span>
              <span className="flex items-center gap-1">
                <Mic className="w-3.5 h-3.5" />
                {SPEAKERS.map((s) => s.name).join(" · ")}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 bg-gray-50 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setShowFullVideo(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
              style={{ backgroundColor: "#1D2B4F" }}
            >
              <Play className="w-4 h-4 fill-white" />
              Watch Event
            </button>
            <button
              onClick={onNavigate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
              style={{ backgroundColor: "#830051" }}
            >
              Navigate to Analytics
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Video Modal */}
      <AnimatePresence>
        {showFullVideo && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(15, 23, 42, 0.85)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFullVideo(false)}
          >
            <motion.div
              className="w-full max-w-3xl mx-6 rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: "#0F172A" }}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
                <div>
                  <div className="text-white text-sm">{WEBINAR_TITLE}</div>
                  <div className="text-white/50 text-xs mt-0.5">Prof. Alan Ashworth · UCSF · 58 min · May 2026</div>
                </div>
                <button onClick={() => setShowFullVideo(false)} className="text-white/40 hover:text-white/80 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Area */}
              <div className="relative" style={{ paddingBottom: "56.25%" }}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <motion.div
                    className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center cursor-pointer"
                    style={{ background: "rgba(131,0,81,0.7)" }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Play className="w-9 h-9 text-white fill-white ml-1" />
                  </motion.div>
                  <div className="text-white/60 text-sm">Full webinar — 58:00</div>
                  <div className="absolute bottom-4 left-0 right-0 px-6">
                    <div className="h-1 rounded-full bg-white/10">
                      <div className="h-full w-0 rounded-full" style={{ background: "#830051" }}></div>
                    </div>
                    <div className="flex items-center justify-between text-white/30 text-xs mt-1.5">
                      <span>0:00</span>
                      <span>58:00</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-6 flex items-center gap-2">
                    <div className="bg-red-600 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                      REC
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter List */}
              <div className="border-t border-white/10">
                <div className="px-6 py-3 text-xs text-white/40 border-b border-white/10">Chapters</div>
                {TIMELINE.map((entry) => (
                  <button
                    key={entry.id}
                    className="w-full flex items-center gap-4 px-6 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                  >
                    <span className="text-xs font-mono w-10 flex-shrink-0" style={{ color: "#830051" }}>
                      {entry.timestamp}
                    </span>
                    <span className="text-xs text-white/70 flex-1">{entry.topic}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* AI Executive Summary */}
          <div className="px-8 pt-6 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4" style={{ color: "#830051" }} />
              <h3 style={{ color: "#1D2B4F" }}>AI Executive Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {EXECUTIVE_SUMMARY.map((item, idx) => (
                <motion.div
                  key={item.title}
                  className="rounded-xl p-4 border border-gray-100"
                  style={{ background: item.bg }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.color }}>
                      <item.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: item.color }}>
                        {item.title}
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Smart Timeline */}
          <div className="px-8 pb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color: "#1D2B4F" }} />
                <h3 style={{ color: "#1D2B4F" }}>Smart Timeline</h3>
                <span className="text-xs text-gray-400 ml-1">{filtered.length} sections</span>
              </div>
            </div>

            {/* Timeline Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Table Header */}
              <div className="grid text-xs text-gray-500 px-5 py-3 border-b border-gray-100 bg-gray-50" style={{ gridTemplateColumns: "80px 1fr 2fr 160px" }}>
                <span>Timestamp</span>
                <span>Topic</span>
                <span>AI Summary</span>
                <span>Actions</span>
              </div>

              {filtered.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  className={`grid px-5 py-4 border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${selectedEntry?.id === entry.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                  style={{ gridTemplateColumns: "80px 1fr 2fr 160px" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                >
                  {/* Timestamp */}
                  <div className="flex items-start pt-0.5">
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "#F1F5F9", color: "#475569" }}>
                      {entry.timestamp}
                    </span>
                  </div>

                  {/* Topic */}
                  <div className="pr-4">
                    <div className="text-sm mb-1.5" style={{ color: "#1D2B4F" }}>
                      {entry.topic}
                    </div>
                    <CategoryBadge category={entry.category} />
                  </div>

                  {/* AI Summary */}
                  <div className="pr-4">
                    <p className="text-xs text-gray-600 leading-relaxed">{entry.aiSummary}</p>
                    {entry.trials.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {entry.trials.map((t) => (
                          <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-gray-700 hover:text-gray-900"
                      onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                    >
                      <Play className="w-3 h-3" />
                      Watch Clip
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-gray-700 hover:text-gray-900"
                      onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                    >
                      <FileText className="w-3 h-3" />
                      Transcript
                    </button>
                    <button
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      style={{ color: copiedId === entry.id ? "#16A34A" : "#475569" }}
                      onClick={() => handleCopy(entry.id, entry.aiSummary)}
                    >
                      <Copy className="w-3 h-3" />
                      {copiedId === entry.id ? "Copied!" : "Copy Summary"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Section Explorer (expanded row) */}
            <AnimatePresence>
              {selectedEntry && (
                <motion.div
                  className="mt-4 bg-white rounded-xl border border-indigo-200 overflow-hidden shadow-sm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "#1D2B4F", color: "white" }}>
                        {selectedEntry.timestamp}
                      </span>
                      <span className="text-sm" style={{ color: "#1D2B4F" }}>
                        {selectedEntry.topic}
                      </span>
                      <CategoryBadge category={selectedEntry.category} />
                    </div>
                    <button onClick={() => setSelectedEntry(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-12 gap-0">
                    {/* Left: Video + Transcript */}
                    <div className="col-span-7 p-6 border-r border-gray-100">
                      <VideoPlaceholder timestamp={selectedEntry.timestamp} topic={selectedEntry.topic} />

                      <div className="mt-5">
                        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> Transcript excerpt
                        </div>
                        <div className="text-xs text-gray-700 leading-relaxed p-4 rounded-lg bg-gray-50 border border-gray-100">
                          {selectedEntry.transcript}
                        </div>
                      </div>
                    </div>

                    {/* Right: AI Insights */}
                    <div className="col-span-5 p-6 space-y-5">
                      <div>
                        <div className="text-xs mb-2.5" style={{ color: "#830051" }}>
                          Highlights
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedEntry.highlights.map((h) => (
                            <span key={h} className="text-xs px-2.5 py-1 rounded-full border" style={{ background: "#FDF2F8", borderColor: "#F9A8D4", color: "#9D174D" }}>
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs mb-2.5" style={{ color: "#1D2B4F" }}>
                          Key Data Points
                        </div>
                        <div className="space-y-2">
                          {selectedEntry.keyDataPoints.map((d, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#1D2B4F" }}></div>
                              {d}
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedEntry.trials.length > 0 && (
                        <div>
                          <div className="text-xs mb-2.5" style={{ color: "#1D4ED8" }}>
                            Referenced Trials
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedEntry.trials.map((t) => (
                              <span key={t} className="text-xs px-2.5 py-1 rounded-lg" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="text-xs mb-2.5" style={{ color: "#047857" }}>
                          Clinical Insights
                        </div>
                        <div className="space-y-2">
                          {selectedEntry.clinicalInsights.map((c, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-700 p-2.5 rounded-lg" style={{ background: "#F0FDF4" }}>
                              <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: "#16A34A" }}></div>
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transcript..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-indigo-300 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
              <Filter className="w-3.5 h-3.5" /> Filter by category
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTER_TYPES.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                  style={
                    activeFilter === f
                      ? { background: "#830051", color: "white", borderColor: "#830051" }
                      : { background: "white", color: "#475569", borderColor: "#E2E8F0" }
                  }
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Key Moments */}
          <div className="p-4 flex-1">
            <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> Key Moments
            </div>
            <div className="space-y-2">
              {KEY_MOMENTS.map((km, idx) => {
                const entry = TIMELINE.find((e) => e.id === km.id);
                return (
                  <motion.button
                    key={km.id}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors group"
                    style={{ background: selectedEntry?.id === km.id ? "#EEF2FF" : "white" }}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.07 }}
                    onClick={() => entry && setSelectedEntry(selectedEntry?.id === km.id ? null : entry)}
                  >
                    <span className="text-xs font-mono flex-shrink-0 mt-0.5" style={{ color: "#830051" }}>
                      {km.timestamp}
                    </span>
                    <span className="text-xs text-gray-700 leading-snug group-hover:text-gray-900 transition-colors">{km.label}</span>
                    <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0 mt-0.5 ml-auto group-hover:text-gray-500" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Speakers */}
          <div className="p-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" /> Speakers
            </div>
            <div className="space-y-2.5">
              {SPEAKERS.map((s) => (
                <div key={s.name} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={{ background: "#1D2B4F" }}>
                    {s.name.split(" ").pop()?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: "#1D2B4F" }}>
                      {s.name}
                    </div>
                    <div className="text-xs text-gray-400 leading-snug">{s.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
