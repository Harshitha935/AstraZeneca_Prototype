import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle, Clock, Phone, Folder, FileText, FileSpreadsheet,
  Image, Send, Bell, Calendar, Radio, Megaphone, Newspaper,
} from "lucide-react";

type PortalType = "open" | "student" | "hcp";

interface Frame1Props {
  onMedicalAffairs: (query: string) => void;
  onChat: (query: string) => void;
  portalType?: PortalType;
}

const desktopIcons = [
  { icon: Folder,         label: "Patient Cases",   color: "#FDB022" },
  { icon: Folder,         label: "Research Papers", color: "#FDB022" },
  { icon: FileText,       label: "ASCO 2026",       color: "#185ABD" },
  { icon: FileSpreadsheet,label: "Treatment Data",  color: "#217346" },
  { icon: FileText,       label: "Guidelines",      color: "#185ABD" },
  { icon: Image,          label: "Imaging",         color: "#D13438" },
];

const quickQueries = [
  "What's the current evidence on [drug] in patients who've already progressed on a PD-1 inhibitor — any real-world data beyond the trial population?",
  "Has anything come out of ASCO this year on sequencing for HER2-low after first-line progression?",
];

// ── News data ─────────────────────────────────────────────────────────────────
type NewsCategory = "az" | "conference" | "news";
type NewsSection  = "event" | "conference" | "announcement" | "medical";
type FilterType   = "all" | "az" | "conference" | "news";

interface NewsItem {
  id: string;
  category: NewsCategory;
  section: NewsSection;
  title: string;
  summary: string;
  time: string;
  isNew: boolean;
  tag?: string;
}

const CAT_COLOR: Record<NewsCategory, string> = {
  az: "#FFC107",
  conference: "#2196F3",
  news: "#9E9E9E",
};

const NEWS_ITEMS: NewsItem[] = [
  { id: "e1", category: "conference", section: "event",
    title: "ASCO 2026 Annual Meeting",
    summary: "Chicago · Jun 7–11 · 3 AZ-sponsored oral sessions confirmed",
    time: "In 3 days", isNew: true, tag: "ASCO" },
  { id: "e2", category: "az", section: "event",
    title: "AZ Oncology MSL National Briefing",
    summary: "Virtual · Jun 12 · DDR update + LAURA OS data deep-dive",
    time: "In 8 days", isNew: true, tag: "MSL" },
  { id: "e3", category: "conference", section: "event",
    title: "ESMO 2026 — Abstract Submissions",
    summary: "Deadline: Jul 15 · DDR pathway & precision oncology tracks",
    time: "In 41 days", isNew: false, tag: "ESMO" },
  { id: "c1", category: "conference", section: "conference",
    title: "AACR 2026 — DDR Session Highlights",
    summary: "5 key abstracts from the DDR symposium now available for MSL review.",
    time: "1d ago", isNew: true, tag: "DDR" },
  { id: "c2", category: "conference", section: "conference",
    title: "WCLC 2026 — NSCLC Precision Medicine Recap",
    summary: "EGFR-targeted therapy & combination data. Slide deck in MSL portal.",
    time: "3d ago", isNew: false, tag: "NSCLC" },
  { id: "a1", category: "az", section: "announcement",
    title: "LAURA Trial — Final OS Data Published",
    summary: "Overall survival results now in NEJM. MA cleared for HCP discussion.",
    time: "2h ago", isNew: true, tag: "LAURA" },
  { id: "a2", category: "az", section: "announcement",
    title: "MANTA Platform Trial — Milestone Update",
    summary: "Interim recruitment target achieved. DDR + Osimertinib arm on track Q3.",
    time: "6h ago", isNew: true, tag: "MANTA" },
  { id: "a3", category: "az", section: "announcement",
    title: "AZ Semantic Nervous System — v2.4",
    summary: "248 new nodes added including IO combination pathways and DDR biomarkers.",
    time: "1d ago", isNew: false, tag: "Platform" },
  { id: "m1", category: "news", section: "medical",
    title: "FDA Breakthrough — ATR Inhibitor Class",
    summary: "ATR inhibitors receive breakthrough therapy designation for DDR-high NSCLC.",
    time: "2d ago", isNew: true, tag: "Regulatory" },
  { id: "m2", category: "news", section: "medical",
    title: "PARP Resistance — New Meta-analysis",
    summary: "Nature Medicine: resistance pathways characterised across 1,200+ patients.",
    time: "3d ago", isNew: false, tag: "Research" },
  { id: "m3", category: "news", section: "medical",
    title: "EMA Guidance — DDR Biomarker Stratification",
    summary: "New EMA guidance on biomarker endpoints for DDR pathway trials.",
    time: "5d ago", isNew: false, tag: "Regulatory" },
];

const FILTER_LABELS: Record<FilterType, string> = {
  all: "All", az: "AZ", conference: "Conferences", news: "News",
};

// ── NewsCard ──────────────────────────────────────────────────────────────────
function NewsCard({ item }: { item: NewsItem }) {
  const color = CAT_COLOR[item.category];
  return (
    <div className="flex gap-2 p-2.5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer">
      <div className="w-0.5 rounded-full flex-shrink-0 self-stretch" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1 mb-0.5">
          <p className="text-[9.5px] font-semibold leading-snug flex-1" style={{ color: "#1D2B4F" }}>
            {item.title}
          </p>
          {item.isNew && (
            <span className="flex-shrink-0 text-[6.5px] px-1 py-0.5 rounded font-bold uppercase"
              style={{ backgroundColor: color + "28", color }}>NEW</span>
          )}
        </div>
        <p className="text-[8px] text-gray-500 leading-relaxed mb-1">{item.summary}</p>
        <div className="flex items-center gap-1.5">
          {item.tag && (
            <span className="text-[6.5px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: color + "18", color }}>{item.tag}</span>
          )}
          <span className="text-[7px] text-gray-400">{item.time}</span>
        </div>
      </div>
    </div>
  );
}

// ── NewsSection ───────────────────────────────────────────────────────────────
function NewsSection({
  title, icon: Icon, items, accentColor,
}: {
  title: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  items: NewsItem[];
  accentColor: string;
}) {
  if (items.length === 0) return null;
  const newInSec = items.filter(i => i.isNew).length;
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3 h-3" style={{ color: accentColor }} />
        <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">{title}</span>
        {newInSec > 0 && (
          <span className="text-[6.5px] px-1 py-0.5 rounded-full font-bold text-white"
            style={{ backgroundColor: accentColor }}>{newInSec} new</span>
        )}
        <span className="ml-auto text-[7px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {items.map(item => <NewsCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function Frame1SignalEntry({ onMedicalAffairs, onChat, portalType = "hcp" }: Frame1Props) {
  const [isChatOpen,      setIsChatOpen]      = useState(false);
  const [showResponse,    setShowResponse]    = useState(false);
  const [showMARedirect,  setShowMARedirect]  = useState(false);
  const [selectedQuery,   setSelectedQuery]   = useState("");
  const [inputValue,      setInputValue]      = useState("What is DDR?");
  const [isDrawerOpen,    setIsDrawerOpen]    = useState(true);
  const [activeFilter,    setActiveFilter]    = useState<FilterType>("all");
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setClock(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    }, 10_000);
    return () => clearInterval(id);
  }, []);

  const handleSendMessage = () => {
    if (inputValue.trim()) onChat(inputValue.trim());
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (value.trim()) onChat(value.trim());
  };

  const handleConnectMedicalAffairs = () => {
    onMedicalAffairs(selectedQuery);
  };

  const newCount      = NEWS_ITEMS.filter(i => i.isNew).length;
  const filteredItems = NEWS_ITEMS.filter(i => activeFilter === "all" || i.category === activeFilter);
  const sectionItems  = (sec: NewsSection) => filteredItems.filter(i => i.section === sec);

  return (
    <div className="h-full flex flex-col">

      {/* Desktop Screen Mockup */}
      <div className="flex-1 overflow-hidden">
        <div
          className="h-full p-8 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4D9DE0 0%, #2563EB 50%, #1E40AF 100%)" }}
        >
          <div className="absolute inset-0 opacity-30" style={{
            background: "radial-gradient(circle at 30% 50%, rgba(59,130,246,0.5) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(96,165,250,0.4) 0%, transparent 50%)",
          }} />

          {/* Desktop Icons — hidden for Student variant */}
          {portalType !== "student" && (
            <div className="absolute left-6 top-6 space-y-6">
              {desktopIcons.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div key={idx}
                    className="flex flex-col items-center gap-1 cursor-pointer group w-20"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}>
                    <div className="w-12 h-12 flex items-center justify-center group-hover:bg-white/10 rounded transition-colors">
                      <Icon className="w-10 h-10" style={{ color: item.color }} />
                    </div>
                    <span className="text-[10px] text-white text-center leading-tight drop-shadow-md">{item.label}</span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Taskbar */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-white/10 backdrop-blur-xl border-t border-white/20 flex items-center justify-center px-4">
            {portalType !== "student" && (
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center"><Folder className="w-5 h-5 text-white" /></div>
                <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center"><FileText className="w-5 h-5 text-white" /></div>
                <div className="w-8 h-8 rounded bg-green-600 flex items-center justify-center"><FileSpreadsheet className="w-5 h-5 text-white" /></div>
                <div className="w-8 h-8 rounded bg-orange-500 flex items-center justify-center"><Image className="w-5 h-5 text-white" /></div>
              </div>
            )}
            <div className="absolute right-4">
              <span className="text-white/90 text-[10px]">{clock}</span>
            </div>
          </div>

          {/* ── Chat Widget ── */}
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
                key="icon"
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                onClick={() => setIsChatOpen(true)}
                className="absolute right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-50"
                style={{ backgroundColor: "#830051", bottom: "80px" }}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="w-8 h-8 text-white" />
              </motion.button>
            ) : (

              /* ── Expanded Dialog ── */
              <motion.div
                key="chat"
                initial={{ scale: 0, opacity: 0, originX: 1, originY: 1 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute right-8 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex"
                style={{ bottom: "80px", maxHeight: "440px" }}
              >

                {/* ── Chat panel (left) ── */}
                <div className="w-[380px] flex flex-col overflow-hidden flex-shrink-0">

                  {/* Header */}
                  <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
                    style={{ backgroundColor: "#830051" }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-white font-semibold">AZ Scientific Exchange</span>
                      </div>
                      <p className="text-sm text-white/80 mt-0.5">How can we help you today?</p>
                    </div>

                    {/* Bell toggle */}
                    <button
                      onClick={() => setIsDrawerOpen(o => !o)}
                      className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                      style={{ backgroundColor: isDrawerOpen ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)" }}
                      title="News & Updates"
                    >
                      <Bell className="w-4 h-4 text-white" />
                      {newCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-[7px] font-bold text-white flex items-center justify-center">
                          {newCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "300px" }}>
                    {!showResponse && !showMARedirect ? (
                      <>
                        {quickQueries.map((query, idx) => (
                          <motion.button key={idx}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => {
                              if (idx === 0) {
                                setSelectedQuery(query);
                                setShowMARedirect(true);
                              } else {
                                onChat(query);
                              }
                            }}
                            className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-left transition-colors border border-gray-200">
                            <div className="text-sm text-gray-700 leading-relaxed">{query}</div>
                          </motion.button>
                        ))}

                        <motion.button
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                          onClick={handleConnectMedicalAffairs}
                          className="w-full bg-blue-50 hover:bg-blue-100 rounded-xl p-4 flex items-center gap-3 transition-colors border border-blue-200">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#1D2B4F" }}>
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm" style={{ color: "#1D2B4F" }}>Pick up where you left off</div>
                            <div className="text-xs text-gray-600 mt-0.5">Continue your last conversation</div>
                          </div>
                        </motion.button>

                        <motion.button
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                          onClick={handleConnectMedicalAffairs}
                          className="w-full rounded-xl p-4 flex items-center gap-3 border-2"
                          style={{ backgroundColor: "#830051", borderColor: "#830051" }}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/20">
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm text-white">Connect to Medical Affairs</div>
                            <div className="text-xs text-white/80 mt-0.5">Speak directly with our medical team</div>
                          </div>
                        </motion.button>
                      </>
                    ) : showMARedirect ? (
                      <>
                        {/* User bubble */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-100 rounded-2xl rounded-tr-sm p-4 ml-auto max-w-[85%]">
                          <div className="text-sm text-gray-800 leading-relaxed">{selectedQuery}</div>
                        </motion.div>

                        {/* Redirect notice */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.25 }}
                          className="rounded-2xl rounded-tl-sm p-4 max-w-[85%] border border-amber-200 bg-amber-50">
                          <div className="flex items-start gap-2 mb-3">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ backgroundColor: "#830051" }}>
                              <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="white" strokeWidth="2" strokeLinecap="round">
                                <path d="M8 7v4M8 5v.5" />
                                <circle cx="8" cy="8" r="6" />
                              </svg>
                            </div>
                            <p className="text-sm text-amber-900 leading-relaxed">
                              This topic cannot be discussed within chat and should be directed to Medical Affairs.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <button
                              onClick={() => { setShowMARedirect(false); onMedicalAffairs(selectedQuery); }}
                              className="w-full rounded-lg p-3 flex items-center justify-center gap-2 text-white text-sm"
                              style={{ backgroundColor: "#830051" }}>
                              <Phone className="w-4 h-4" />
                              Connect me to Medical Affairs
                            </button>
                            <button
                              onClick={() => setShowMARedirect(false)}
                              className="w-full rounded-lg p-3 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-sm text-gray-700">
                              No, I'll do it later
                            </button>
                          </div>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="bg-gray-100 rounded-2xl rounded-tr-sm p-4 ml-auto max-w-[85%]">
                          <div className="text-sm text-gray-800 leading-relaxed">{selectedQuery}</div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }} className="rounded-2xl rounded-tl-sm p-4 max-w-[85%]"
                          style={{ backgroundColor: "#830051" }}>
                          <div className="text-sm text-white leading-relaxed">
                            This is a great question that requires detailed medical expertise. This type of information is best discussed directly with our Medical Affairs team.
                          </div>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="text-sm text-amber-900 mb-3">Would you like us to connect you with Medical Affairs?</div>
                          <div className="space-y-2">
                            <button onClick={handleConnectMedicalAffairs}
                              className="w-full rounded-lg p-3 flex items-center justify-center gap-2"
                              style={{ backgroundColor: "#830051" }}>
                              <Phone className="w-4 h-4 text-white" />
                              <span className="text-sm text-white">Yes, connect me to Medical Affairs</span>
                            </button>
                            <button onClick={() => setShowResponse(false)}
                              className="w-full rounded-lg p-3 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50">
                              <MessageCircle className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">No, keep me in chat</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </div>

                  {/* Input bar */}
                  <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
                    <div className="flex gap-2">
                      <input type="text" value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                        placeholder="Type your question..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm bg-white"
                        style={{ "--tw-ring-color": "#830051" } as React.CSSProperties} />
                      <button onClick={handleSendMessage}
                        className="px-4 py-2 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#830051" }}>
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── News & Updates panel (right, inside dialog) ── */}
                <motion.div
                  animate={{ width: isDrawerOpen ? 260 : 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden flex-shrink-0 border-l border-gray-100"
                >
                  <div className="w-[260px] h-full flex flex-col">

                    {/* Panel header */}
                    <div className="flex-shrink-0 px-3 py-3 border-b border-gray-200"
                      style={{ backgroundColor: "#1D2B4F" }}>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5 text-white" />
                          <span className="text-xs font-semibold text-white">News & Updates</span>
                          {newCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[7px] font-bold text-white"
                              style={{ backgroundColor: "#830051" }}>{newCount} new</span>
                          )}
                        </div>
                        <span className="text-[8px] text-white/40 font-mono">04 Jun 2026</span>
                      </div>

                      {/* Filter tabs */}
                      <div className="flex items-center gap-1">
                        {(["all", "az", "conference", "news"] as FilterType[]).map((f) => {
                          const newInF = NEWS_ITEMS.filter(i =>
                            (f === "all" ? true : i.category === f) && i.isNew
                          ).length;
                          return (
                            <button key={f} onClick={() => setActiveFilter(f)}
                              className="relative px-2 py-1 rounded-md text-[8px] font-medium transition-all flex items-center gap-0.5"
                              style={activeFilter === f
                                ? { backgroundColor: "#830051", color: "white" }
                                : { color: "rgba(255,255,255,0.5)" }}>
                              {FILTER_LABELS[f]}
                              {newInF > 0 && (
                                <span className={`text-[6px] rounded-full w-3 h-3 flex items-center justify-center font-bold ${
                                  activeFilter === f ? "bg-white/30 text-white" : "bg-amber-400 text-white"
                                }`}>{newInF}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scrollable news */}
                    <div className="flex-1 overflow-y-auto p-2.5 bg-gray-50">
                      <NewsSection title="Upcoming Events"    icon={Calendar}  items={sectionItems("event")}        accentColor="#2196F3" />
                      <NewsSection title="Conference Updates" icon={Radio}      items={sectionItems("conference")}   accentColor="#2196F3" />
                      <NewsSection title="AZ Announcements"  icon={Megaphone}  items={sectionItems("announcement")} accentColor="#FFC107" />
                      <NewsSection title="Medical News"       icon={Newspaper}  items={sectionItems("medical")}     accentColor="#9E9E9E" />
                      {filteredItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <Bell className="w-7 h-7 text-gray-300 mb-2" />
                          <p className="text-[9px] text-gray-400">No updates in this category</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 px-3 py-2 border-t border-gray-100 bg-white flex items-center justify-between">
                      <span className="text-[7.5px] text-gray-400 font-mono">
                        {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
                        {filteredItems.filter(i => i.isNew).length > 0
                          ? ` · ${filteredItems.filter(i => i.isNew).length} new` : ""}
                      </span>
                      <button className="text-[7.5px] text-gray-400 hover:text-gray-600 transition-colors">
                        Mark all read
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
