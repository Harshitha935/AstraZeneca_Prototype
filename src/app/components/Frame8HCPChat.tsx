import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot, Lock, BookOpen, ArrowRight } from "lucide-react";

interface Frame8Props {
  onNavigate: () => void;
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

export function Frame8HCPChat({ onNavigate }: Frame8Props) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [showPapers, setShowPapers] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    setQuery(input);
    setInput("");
    setSubmitted(true);
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setShowPapers(true);
    }, 1000);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="h-full bg-[#F5F5F7] flex overflow-hidden">

      {/* ── Chat ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Chat header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#1D2B4F" }}>
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#1D2B4F" }}>AZ Medical Information Assistant</p>
            <p className="text-[10px] text-gray-500">Responds with published scientific literature only</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] text-blue-700 font-medium">HCP External · Dr. Okafor</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "#1D2B4F" }}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-700">
                Welcome Dr. Okafor. Ask me any medical question — I'll retrieve <strong>published scientific literature</strong> relevant to your query. Internal or confidential data will not be returned.
              </p>
            </div>
          </motion.div>

          {/* HCP message */}
          <AnimatePresence>
            {submitted && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 flex-row-reverse">
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
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "#1D2B4F" }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-2">
                  <motion.div className="flex gap-1" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>
                    {[0, 1, 2].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-gray-400" />)}
                  </motion.div>
                  <span className="text-[10px] text-gray-400">Searching published literature…</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Papers */}
          <AnimatePresence>
            {showPapers && (
              <>
                {/* Intro line */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "#1D2B4F" }}>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-700">
                      I found <strong>3 relevant published papers</strong> on DNA Damage Response. Here are the key findings:
                    </p>
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
                    {/* Spacer for bot avatar alignment */}
                    <div className="w-8 flex-shrink-0" />
                    <div className="flex-1 max-w-2xl rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                      {/* Card header */}
                      <div className="px-4 pt-3 pb-2" style={{ backgroundColor: paper.bg }}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" style={{ color: paper.accent }} />
                            <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: paper.accent }}>
                              Paper {i + 1} of 3
                            </span>
                          </div>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                            ✓ Cleared — Published
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold leading-snug" style={{ color: "#1D2B4F" }}>
                          {paper.title}
                        </p>
                        <p className="text-[9px] text-gray-500 mt-0.5">
                          {paper.authors} · <em>{paper.journal}</em> · {paper.year} · <span className="font-mono">{paper.doi}</span>
                        </p>
                      </div>
                      {/* Card body */}
                      <div className="bg-white px-4 py-3">
                        <p className="text-[10px] text-gray-600 leading-relaxed">{paper.summary}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Blocked notice */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "#1D2B4F" }}>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-700 mb-2">
                      That's all the <strong>published data</strong> available for your query.
                    </p>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                      <Lock className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <p className="text-[9px] text-red-700">
                        3 additional connected nodes were identified in the knowledge graph but <strong>access was prohibited</strong> for your access tier.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
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
              <p className="text-[10px] text-gray-400">Session active</p>
              {showPapers && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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
          <p className="text-xs font-semibold" style={{ color: "#1D2B4F" }}>Access Level</p>
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-blue-900">Dr. James Okafor</p>
            <p className="text-[9px] text-blue-600">Oncology Consultant · NHS Trust</p>
            <div className="flex items-center gap-1 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[9px] text-blue-800 font-medium">HCP External</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Cleared For</p>
            {["Published peer-reviewed literature", "Approved prescribing information", "Public clinical trial results"].map((item) => (
              <div key={item} className="flex items-start gap-1.5 mb-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 10 10" fill="none" className="w-2 h-2"><path d="M2 5l2 2 4-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-[9px] text-gray-600">{item}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Not Accessible</p>
            {["Unpublished / internal trial data", "Pipeline intelligence", "Internal MSL materials", "Pre-approval submissions"].map((item) => (
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
