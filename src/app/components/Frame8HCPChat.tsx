import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, Lock, BookOpen, ArrowRight, X, Copy, Check } from "lucide-react";
import { logEvent, DEMO_QUERY } from "../lib/activityLog";
import type { SearchMode } from "../lib/activityLog";

export type PortalType = "open" | "student" | "hcp" | "patient";

interface Frame8Props {
  onNavigate: () => void;
  portalType?: PortalType;
  initialQuery?: string;
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
      "Phase II study (n=118) in DDR-high NSCLC patients (≥2 DDR gene alterations by ctDNA). PARP inhibitor arm achieved 34% ORR vs 8% in unselected cohort — a four-fold improvement. Grade 3+ haematological events in 12%. Authors recommend DDR biomarker stratification as standard for future IO/DDRi combination trials.",
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
      "In vitro and in vivo data from EGFR-mutant NSCLC models showing synergistic cell death when combining osimertinib with ceralasertib (ATR inhibitor). Mechanism: osimertinib induces stalled replication forks; ATR co-inhibition prevents fork restart, triggering DNA catastrophe. Provides mechanistic basis for the ongoing MANTA platform trial.",
    accent: "#16A34A",
    bg: "#F0FDF4",
  },
];

const PORTAL_CONFIG = {
  open: {
    label: "Open User",
    clearance: "Open Portal Clearance",
    searchModeLabel: "Light Search",
    searchModeActive: true,
    searchingText: "Light Search — Searching public content…",
    badgeBg: "bg-gray-100 border-gray-200",
    badgeText: "text-gray-700",
    dotColor: "bg-blue-400",
    paperBadge: "✓ Published — Public",
    paperBadgeClass: "bg-gray-100 text-gray-600",
    welcomeMsg:
      "Ask a question to search publicly available scientific content.",
    introMsg: "Light Search results:",
    cleared: ["Published public content", "General scientific information"],
    blocked: [
      "HCP scientific literature",
      "Prescribing information",
      "Clinical trial data",
      "Internal research",
    ],
  },
  student: {
    label: "Student User",
    clearance: "Student Clearance",
    searchModeLabel: "Medium Search",
    searchModeActive: true,
    searchingText: "Running Medium Search…",
    badgeBg: "bg-teal-50 border-teal-200",
    badgeText: "text-teal-800",
    dotColor: "bg-teal-500",
    paperBadge: "✓ Cleared — Published",
    paperBadgeClass: "bg-green-100 text-green-700",
    welcomeMsg:
      "This assistant is strictly for scientific research and educational purposes. You can access published scientific literature via Medium Search.",
    introMsg:
      "I found 3 published papers available for your research:",
    cleared: [
      "Published peer-reviewed literature",
      "Public clinical trial results",
    ],
    blocked: [
      "Promotional documents",
      "HCP-only content",
      "Internal materials",
      "Prescribing information",
    ],
  },
  hcp: {
    label: "HCP User",
    clearance: "HCP Portal Clearance",
    searchModeLabel: "Deep Search",
    searchModeActive: true,
    searchingText: "Running Deep Search…",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-800",
    dotColor: "bg-blue-500",
    paperBadge: "✓ Cleared — Published",
    paperBadgeClass: "bg-green-100 text-green-700",
    welcomeMsg:
      "Ask me any medical question — I’ll retrieve published scientific literature relevant to your query. Internal or confidential data will not be returned.",
    introMsg:
      "I found 3 relevant published papers on DNA Damage Response. Here are the key findings:",
    cleared: [
      "Published peer-reviewed literature",
      "Approved prescribing information",
      "Public clinical trial results",
    ],
    blocked: [
      "Unpublished / internal trial data",
      "Pipeline intelligence",
      "Internal MSL materials",
      "Pre-approval submissions",
    ],
  },
} as const;

export function Frame8HCPChat({ onNavigate, portalType = "hcp", initialQuery = "" }: Frame8Props) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [showPapers, setShowPapers] = useState(false);
  const [ctaDismissed, setCtaDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  const cfg = PORTAL_CONFIG[portalType];
  const isDemoQuery = query === DEMO_QUERY && portalType !== "hcp";

  const SEARCH_MODE_MAP: Record<string, SearchMode> = {
    open: "Light Search", student: "Medium Search", hcp: "Deep Search",
  };
  const ACCESS_RESULT_MAP = {
    open: "answered_light_search", student: "answered_medium_search", hcp: "answered_deep_search",
  } as const;

  const submitQuery = (submittedQuery: string) => {
    if (!submittedQuery.trim()) return;
    setQuery(submittedQuery);
    setSubmitted(true);
    setSearching(true);
    logEvent({
      portalType,
      action: "query_submit",
      query: submittedQuery,
      accessResult: "n/a",
      searchMode: SEARCH_MODE_MAP[portalType],
      sourcesReturned: 0,
    });
    setTimeout(() => {
      setSearching(false);
      setShowPapers(true);
      const isDemo = submittedQuery === DEMO_QUERY && portalType !== "hcp";
      logEvent({
        portalType,
        action: "results_shown",
        query: submittedQuery,
        accessResult: isDemo
          ? portalType === "open" ? "gated_registration_required" : "gated_out_of_scope"
          : ACCESS_RESULT_MAP[portalType],
        searchMode: SEARCH_MODE_MAP[portalType],
        sourcesReturned: isDemo ? 0 : DDR_PAPERS.length,
      });
    }, 1000);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const submittedQuery = input.trim();
    setInput("");
    submitQuery(submittedQuery);
  };

  // Carry the query typed on the landing page straight into the chat
  useEffect(() => {
    if (initialQuery.trim()) submitQuery(initialQuery.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const STUDENT_ANSWER =
    "DNA Damage Response (DDR) is a sophisticated network of cellular surveillance pathways that maintains genomic integrity by detecting and repairing DNA lesions. The core signalling cascade involves sensor proteins (MRN complex, RPA) that recruit and activate master kinases — primarily ATM and ATR — which phosphorylate downstream effectors including CHK1, CHK2, and H2AX. These signals coordinate cell cycle arrest, DNA repair, and — when damage is irreparable — apoptotic elimination of the cell. In oncology, DDR pathway alterations are found in approximately 40% of solid tumours, creating targetable synthetic lethal vulnerabilities. Most powerfully, PARP inhibition in homologous recombination-deficient tumours (BRCA1/2 mutations) induces catastrophic replication stress. Emerging strategies combine DDR inhibitors (PARPi, ATRi, WEE1i) with targeted agents such as osimertinib to broaden efficacy across biomarker-selected populations.";

  const handleCopy = () => {
    const sourceLines = DDR_PAPERS.map(
      (p, i) => `${i + 1}. ${p.title} · ${p.journal} · ${p.year} · doi:${p.doi}`,
    ).join("\n");
    const text = `Answer:\n${STUDENT_ANSWER}\n\nSources:\n${sourceLines}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      logEvent({
        portalType,
        action: "copy_answer",
        query,
        accessResult: "answered_medium_search",
        searchMode: "Medium Search",
        sourcesReturned: DDR_PAPERS.length,
      });
    });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full bg-[#F5F5F7] flex overflow-hidden">

      {/* ── Chat ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Chat header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#1D2B4F" }}
          >
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#1D2B4F" }}>
              AZ Medical Information Assistant
            </p>
            <p className="text-[10px] text-gray-500">
              {portalType === "student"
                ? "For scientific research and educational purposes only"
                : "Responds with published scientific literature only"}
            </p>
          </div>
          <div
            className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full border ${cfg.badgeBg}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
            <span className={`text-[10px] font-medium ${cfg.badgeText}`}>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: "#1D2B4F" }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-700">{cfg.welcomeMsg}</p>
            </div>
          </motion.div>

          {/* User message */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 flex-row-reverse"
              >
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-blue-100">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-4 py-3 max-w-lg">
                  <p className="text-sm text-white">{query}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Searching */}
          <AnimatePresence>
            {searching && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: "#1D2B4F" }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-2">
                  <motion.div
                    className="flex gap-1"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-gray-400" />
                    ))}
                  </motion.div>
                  <span className="text-[10px] text-gray-400">{cfg.searchingText}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>

            {/* Demo query gate — open & student */}
            {showPapers && isDemoQuery && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: "#1D2B4F" }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    This content is only available to registered Healthcare Professionals.{" "}
                    <button
                      className="font-medium underline underline-offset-2 hover:opacity-75 transition-opacity"
                      style={{ color: "#830051" }}
                    >
                      Register Now
                    </button>{" "}
                    to access.
                  </p>
                </div>
              </motion.div>
            )}

            {showPapers && portalType === "open" && !isDemoQuery && (
              <>
                {/* Brief answer */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "#1D2B4F" }}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-700">
                      {query.toLowerCase().includes("ddr") || query.toLowerCase().includes("damage")
                        ? "DNA Damage Response (DDR) is a network of cellular pathways that detect, signal, and repair DNA damage. DDR pathway alterations are observed across multiple solid tumour types and are actively studied as therapeutic targets."
                        : "Based on published scientific literature, here is information relevant to your query."}
                    </p>
                  </div>
                </motion.div>

                {/* Sources + Light Search label + CTA — single card */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3"
                >
                  <div className="w-8 flex-shrink-0" />
                  <div className="flex-1 max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Light Search header */}
                    <div className="px-4 py-2.5 border-b border-gray-50 flex items-center gap-2 bg-gray-50/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[9px] font-semibold text-blue-500 uppercase tracking-wide">
                        Light Search Enabled
                      </span>
                    </div>

                    {/* Source list — title + journal only, no buttons */}
                    <div className="px-4 py-3 space-y-3">
                      {DDR_PAPERS.map((paper, i) => (
                        <motion.div
                          key={paper.id}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.08 }}
                          className="flex items-center gap-3"
                        >
                          <div
                            className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: paper.bg }}
                          >
                            <BookOpen className="w-3 h-3" style={{ color: paper.accent }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold text-gray-800 leading-snug line-clamp-1">
                              {paper.title}
                            </p>
                            <p className="text-[8px] text-gray-400 mt-0.5">
                              {paper.journal} · {paper.year}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Dismissible CTA — always shown with results */}
                    <AnimatePresence>
                      {!ctaDismissed && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: 0.55 }}
                          className="mx-3 mb-3 rounded-xl border p-3"
                          style={{ borderColor: "rgba(131,0,81,0.18)", backgroundColor: "rgba(131,0,81,0.02)" }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <p className="text-[10px] font-semibold text-gray-800">
                              Are you a Healthcare Professional?
                            </p>
                            <button
                              onClick={() => {
                                setCtaDismissed(true);
                                logEvent({ portalType, action: "cta_dismiss", query, accessResult: "n/a", searchMode: "Light Search", sourcesReturned: DDR_PAPERS.length });
                              }}
                              className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 -mt-0.5"
                              aria-label="Dismiss"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[9px] text-gray-500 mb-2.5 leading-relaxed">
                            Register and try Deep Search to discover deeper connections, evidence, and richer research content.
                          </p>
                          <button
                            className="px-3 py-1.5 rounded-lg text-white text-[9px] font-medium flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: "#830051" }}
                          >
                            Register for Deep Search <ArrowRight className="w-3 h-3" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </>
            )}

            {/* ── Student results ── */}
            {showPapers && portalType === "student" && !isDemoQuery && (
              <>
                {/* Educational answer */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "#1D2B4F" }}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed">{STUDENT_ANSWER}</p>
                  </div>
                </motion.div>

                {/* Sources card — summaries + copy */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-3"
                >
                  <div className="w-8 flex-shrink-0" />
                  <div className="flex-1 max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Sources header + Copy button */}
                    <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between bg-gray-50/70">
                      <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wide">
                        Sources
                      </span>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium transition-all"
                        style={
                          copied
                            ? { backgroundColor: "#f0fdf4", color: "#16a34a" }
                            : { backgroundColor: "#f3f4f6", color: "#4b5563" }
                        }
                      >
                        {copied
                          ? <><Check className="w-3 h-3" /> Copied</>
                          : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>

                    {/* Paper list with summaries */}
                    <div className="divide-y divide-gray-50">
                      {DDR_PAPERS.map((paper, i) => (
                        <motion.div
                          key={paper.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="px-4 py-3"
                        >
                          <div className="flex items-start gap-2.5 mb-1.5">
                            <div
                              className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center mt-0.5"
                              style={{ backgroundColor: paper.bg }}
                            >
                              <BookOpen className="w-3 h-3" style={{ color: paper.accent }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-semibold text-gray-800 leading-snug">
                                {paper.title}
                              </p>
                              <p className="text-[8px] text-gray-400 mt-0.5">
                                {paper.authors} · <em>{paper.journal}</em> · {paper.year}
                              </p>
                            </div>
                          </div>
                          <p className="text-[9px] text-gray-500 leading-relaxed pl-8">
                            {paper.summary}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                  </div>
                </motion.div>
              </>
            )}

            {/* ── HCP results ── */}
            {showPapers && portalType === "hcp" && (
              <>
                {/* Intro */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "#1D2B4F" }}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-700">{cfg.introMsg}</p>
                  </div>
                </motion.div>

                {/* Paper cards */}
                {DDR_PAPERS.map((paper, i) => (
                  <motion.div
                    key={paper.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 flex-shrink-0" />
                    <div className="flex-1 max-w-2xl rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      <div className="px-4 pt-3 pb-2" style={{ backgroundColor: paper.bg }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" style={{ color: paper.accent }} />
                            <span
                              className="text-[9px] font-bold uppercase tracking-wide"
                              style={{ color: paper.accent }}
                            >
                              Paper {i + 1} of 3
                            </span>
                          </div>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-medium ${cfg.paperBadgeClass}`}>
                            {cfg.paperBadge}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold leading-snug" style={{ color: "#1D2B4F" }}>
                          {paper.title}
                        </p>
                        <p className="text-[9px] text-gray-500 mt-0.5">
                          {paper.authors} · <em>{paper.journal}</em> · {paper.year} ·{" "}
                          <span className="font-mono">{paper.doi}</span>
                        </p>
                      </div>
                      <div className="bg-white px-4 py-3">
                        <p className="text-[10px] text-gray-600 leading-relaxed">{paper.summary}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* HCP gate notice */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "#1D2B4F" }}
                  >
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-700 mb-2">
                      That&rsquo;s all the <strong>published data</strong> available for your query.
                    </p>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                      <Lock className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <p className="text-[9px] text-red-700">
                        3 additional connected nodes were identified in the knowledge graph but{" "}
                        <strong>access was prohibited</strong> for your access tier.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Input bar */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          {!submitted ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type your medical question… e.g. What is DDR?"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": "#830051" } as React.CSSProperties}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all"
                style={{ backgroundColor: "#830051" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {showPapers && (
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setShowPapers(false);
                    setSearching(false);
                    setCtaDismissed(false);
                    setCopied(false);
                    setQuery("");
                  }}
                  className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                >
                  ← Ask another question
                </button>
              )}
              {showPapers && portalType === "hcp" && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={onNavigate}
                  className="px-4 py-2 rounded-lg text-white flex items-center gap-2 text-xs"
                  style={{ backgroundColor: "#830051" }}
                >
                  View backbone log <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Access panel ── */}
      <div className="w-64 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-[#F5F5F7]">
          <p className="text-xs font-semibold" style={{ color: "#1D2B4F" }}>
            Session Access
          </p>
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">

          {/* Access class */}
          <div className={`border rounded-xl p-3 ${cfg.badgeBg}`}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
              <span className={`text-[10px] font-semibold ${cfg.badgeText}`}>
                {cfg.label}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-start gap-1">
                <span className="text-[8px] font-medium text-gray-500 flex-shrink-0">Clearance:</span>
                <span className="text-[8px] text-gray-700">{cfg.clearance}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8px] font-medium text-gray-500">
                  {cfg.searchModeLabel}:
                </span>
                {cfg.searchModeActive ? (
                  <span className="text-[8px] text-green-600 font-medium">Active</span>
                ) : (
                  <span className="text-[8px] text-red-600 font-medium flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Student notice */}
          {portalType === "student" && (
            <div className="px-3 py-2 rounded-lg bg-teal-50 border border-teal-100">
              <p className="text-[8px] text-teal-700 leading-relaxed italic">
                Strictly for scientific research and educational purposes.
              </p>
            </div>
          )}

          {/* Accessible */}
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Accessible
            </p>
            {cfg.cleared.map((item) => (
              <div key={item} className="flex items-start gap-1.5 mb-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 10 10" fill="none" className="w-2 h-2">
                    <path
                      d="M2 5l2 2 4-4"
                      stroke="#16A34A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[9px] text-gray-600">{item}</span>
              </div>
            ))}
          </div>

          {/* Not accessible */}
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Not Accessible
            </p>
            {cfg.blocked.map((item) => (
              <div key={item} className="flex items-start gap-1.5 mb-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lock className="w-2 h-2 text-red-500" />
                </div>
                <span className="text-[9px] text-gray-500">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
