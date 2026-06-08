import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, MessageCircle, BookOpen, Send, Bot,
  GraduationCap, X, ChevronRight, ArrowRight,
} from "lucide-react";
import { DEMO_QUERY } from "../lib/activityLog";

type PortalType = "open" | "student";

interface Frame1PortalProps {
  portalType: PortalType;
  onChat: (query: string) => void;
  onMedicalAffairs: (query: string) => void;
}

const STUDENT_RESOURCES = [
  {
    id: "s1",
    title: "DNA Damage Response Kinases as Therapeutic Targets",
    journal: "Nature Reviews Cancer · 2024",
    desc: "Comprehensive review of ATM, ATR, PARP1/2, and WEE1 as druggable nodes.",
    tag: "Review",
  },
  {
    id: "s2",
    title: "PARP Inhibition in DDR-Deficient NSCLC",
    journal: "Journal of Clinical Oncology · 2023",
    desc: "Phase II study (n=118) on biomarker-selected PARP inhibitor efficacy.",
    tag: "Clinical Study",
  },
  {
    id: "s3",
    title: "Osimertinib + ATR Inhibition: Preclinical Evidence",
    journal: "Cancer Research · 2024",
    desc: "Synergistic mechanism study in EGFR-mutant NSCLC models.",
    tag: "Preclinical",
  },
];

const OPEN_QUICK_TOPICS = [
  "What are DDR pathways?",
  "How do PARP inhibitors work?",
  "ATR inhibition mechanism",
];

const STUDENT_QUICK_TOPICS = [
  "DNA Damage Response in NSCLC",
  "PARP inhibitor resistance mechanisms",
  "ATR/ATM synthetic lethality",
];

export function Frame1PortalLanding({ portalType, onChat }: Frame1PortalProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [heroInput, setHeroInput] = useState(DEMO_QUERY);

  const isStudent = portalType === "student";
  const topics = isStudent ? STUDENT_QUICK_TOPICS : OPEN_QUICK_TOPICS;

  const handleHeroSearch = () => {
    if (heroInput.trim()) onChat(heroInput.trim());
  };

  const handleChatSend = () => {
    if (chatInput.trim()) {
      onChat(chatInput.trim());
      setChatInput("");
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#F5F5F7] relative">

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#830051" }}
          >
            <span className="text-white text-[10px] font-bold tracking-tight">AZ</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight" style={{ color: "#1D2B4F" }}>
              {isStudent ? "AZ Student Portal" : "AZBridge"}
            </p>
            {isStudent ? (
              <p className="text-[8px] text-teal-600 font-medium">Student Version</p>
            ) : (
              <p className="text-[8px] text-gray-400">Open Portal</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isStudent && (
            <>
              <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] text-gray-600 hover:bg-gray-50 transition-colors">
                Sign in
              </button>
              <button
                className="px-3 py-1.5 rounded-lg text-white text-[10px] font-medium"
                style={{ backgroundColor: "#830051" }}
              >
                Register as HCP
              </button>
            </>
          )}
          {isStudent && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200">
              <GraduationCap className="w-3 h-3 text-teal-600" />
              <span className="text-[8px] text-teal-700 font-medium">Student Access</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Student disclaimer banner ─────────────────────────────────────── */}
      {isStudent && (
        <div className="bg-teal-50 border-b border-teal-200 px-6 py-2 flex items-center gap-2 flex-shrink-0">
          <GraduationCap className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
          <p className="text-[9px] text-teal-700 leading-relaxed">
            <span className="font-semibold">
              This portal is strictly for scientific research and educational purposes.
            </span>{" "}
            Content is limited to published, peer-reviewed scientific literature.
          </p>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      {isStudent ? (

        /* Student: hero + demo query + published paper cards */
        <div className="flex-1 overflow-y-auto">
          <div
            className="px-8 py-8"
            style={{ background: "linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)" }}
          >
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#0d9488" }}>
                Scientific Research Portal
              </p>
              <h2 className="text-xl font-bold mb-1.5" style={{ color: "#1D2B4F" }}>
                Search Published Scientific Literature
              </h2>
              <p className="text-xs text-gray-500 mb-5 max-w-lg">
                Access peer-reviewed papers and public clinical data.
              </p>
              <div className="flex gap-2 max-w-xl">
                <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
                  <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={heroInput}
                    onChange={(e) => setHeroInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleHeroSearch(); }}
                    placeholder="e.g. DDR mechanisms, PARP inhibitors…"
                    className="flex-1 text-sm focus:outline-none bg-transparent"
                  />
                </div>
                <button
                  onClick={handleHeroSearch}
                  disabled={!heroInput.trim()}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-medium disabled:opacity-40"
                  style={{ backgroundColor: "#830051" }}
                >
                  Search
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => onChat(t)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-gray-200 text-[9px] text-gray-600 hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    {t} <ChevronRight className="w-2.5 h-2.5 text-gray-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Resource cards */}
          <div className="px-8 py-5">
            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Available Resources
            </p>
            <div className="grid grid-cols-3 gap-3">
              {STUDENT_RESOURCES.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => onChat(r.title)}
                  className="bg-white rounded-xl p-4 border border-gray-100 hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-medium border border-teal-100">
                      {r.tag}
                    </span>
                    <BookOpen className="w-3.5 h-3.5 text-gray-200 group-hover:text-teal-300 transition-colors" />
                  </div>
                  <p className="text-[10px] font-semibold text-gray-800 leading-snug mb-1">{r.title}</p>
                  <p className="text-[8px] text-gray-400 mb-2">{r.journal}</p>
                  <p className="text-[9px] text-gray-500 leading-relaxed">{r.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      ) : (

        /* Open Portal: search-first, centered, demo query below quick topics */
        <div
          className="flex-1 flex flex-col items-center justify-center px-8"
          style={{ background: "linear-gradient(160deg, #fdf4ff 0%, #f5f3ff 40%, #eff6ff 100%)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl"
          >
            <div className="text-center mb-8">
              <p
                className="text-[9px] font-semibold uppercase tracking-widest mb-3"
                style={{ color: "#830051" }}
              >
                AZBridge · Open Portal
              </p>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#1D2B4F" }}>
                Search AstraZeneca's Scientific Resources
              </h2>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Ask a question or enter a topic to search publicly available content.
              </p>
            </div>

            {/* Search bar */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleHeroSearch(); }}
                  placeholder="e.g. What is DDR? How do PARP inhibitors work?"
                  className="flex-1 text-sm focus:outline-none bg-transparent"
                />
              </div>
              <button
                onClick={handleHeroSearch}
                disabled={!heroInput.trim()}
                className="px-5 py-3 rounded-xl text-white text-sm font-medium disabled:opacity-40 transition-all"
                style={{ backgroundColor: "#830051" }}
              >
                Search
              </button>
            </div>

            {/* Quick topics */}
            <div className="flex flex-wrap gap-1.5 justify-center mb-6">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => onChat(t)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 border border-gray-200 text-[9px] text-gray-600 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  {t} <ChevronRight className="w-2.5 h-2.5 text-gray-400" />
                </button>
              ))}
            </div>

            {/* Light Search indicator */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[9px] text-gray-400 font-medium">
                Light Search Enabled · Public content only
              </span>
            </div>
          </motion.div>
        </div>

      )}

      {/* ── Floating chat widget ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            key="chat-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsChatOpen(false)}
            className="absolute inset-0 z-40"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!isChatOpen ? (
          <motion.button
            key="chat-fab"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsChatOpen(true)}
            className="absolute right-6 bottom-6 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50"
            style={{ backgroundColor: "#830051" }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-[7px] font-bold text-white flex items-center justify-center">
              AI
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="chat-widget"
            initial={{ scale: 0.9, opacity: 0, originX: 1, originY: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="absolute right-6 bottom-6 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
            style={{ width: "380px", maxHeight: "480px" }}
          >
            {/* Widget header */}
            <div
              className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
              style={{ backgroundColor: "#830051" }}
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold">AZBridge Assistant</p>
                <p className="text-white/70 text-[8px]">
                  {isStudent
                    ? "Published literature only"
                    : "Light Search · Public content only"}
                </p>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white/60 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-2">
              <p className="text-[8px] text-gray-400 text-center pb-1">
                {isStudent ? "Suggested research topics" : "Try a search"}
              </p>
              {topics.map((t, i) => (
                <motion.button
                  key={t}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => onChat(t)}
                  className="w-full bg-white rounded-xl px-3 py-2.5 text-left border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all flex items-center justify-between gap-2"
                >
                  <p className="text-[9px] font-medium text-gray-700 leading-snug">{t}</p>
                  <ArrowRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
                </motion.button>
              ))}

              {!isStudent && (
                <div className="mt-1 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <p className="text-[8px] text-gray-500">
                    Light Search active. Register as an HCP to unlock Deep Search.
                  </p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSend();
                    }
                  }}
                  placeholder="Type your question…"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": "#830051" } as React.CSSProperties}
                />
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40"
                  style={{ backgroundColor: "#830051" }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
