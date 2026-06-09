import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle, Clock, Phone, Folder, FileText, FileSpreadsheet,
  Image, Send, Bell, Calendar, Radio, Megaphone, Newspaper,
  Lock, ShieldCheck, ShieldAlert, KeyRound, X, Eye, EyeOff, Timer,
  ChevronLeft, ChevronRight, RefreshCw, Bookmark, MoreHorizontal,
} from "lucide-react";

type PortalType = "open" | "student" | "hcp";
type AuthState  = "locked" | "modal" | "unlocked";

interface ChatMessage {
  id: string;
  type: "bot" | "system";
  text: string;
}

interface Frame1Props {
  onMedicalAffairs: (query: string) => void;
  onChat: (query: string) => void;
  portalType?: PortalType;
}

const desktopIcons = [
  { icon: Folder,          label: "Patient Cases",   color: "#FDB022" },
  { icon: Folder,          label: "Research Papers", color: "#FDB022" },
  { icon: FileText,        label: "ASCO 2026",       color: "#185ABD" },
  { icon: FileSpreadsheet, label: "Treatment Data",  color: "#217346" },
  { icon: FileText,        label: "Guidelines",      color: "#185ABD" },
  { icon: Image,           label: "Imaging",         color: "#D13438" },
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

const COMPLIANCE_GREETING: ChatMessage = {
  id: "init",
  type: "bot",
  text: "Welcome to AstraZeneca Spain Medical Information. To comply with local regulations (Real Decreto 1416/1994), this service is strictly reserved for verified healthcare professionals. Please verify your identity to continue.",
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
function NewsSectionBlock({
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
  const [isChatOpen,     setIsChatOpen]     = useState(false);
  const [showResponse,   setShowResponse]   = useState(false);
  const [showMARedirect, setShowMARedirect] = useState(false);
  const [selectedQuery,  setSelectedQuery]  = useState("");
  const [inputValue,     setInputValue]     = useState("What is DDR?");
  const [isDrawerOpen,   setIsDrawerOpen]   = useState(true);
  const [activeFilter,   setActiveFilter]   = useState<FilterType>("all");
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  );

  // ── Auth state machine ────────────────────────────────────────────────────
  const [authState, setAuthState] = useState<AuthState>("locked");
  const [oneKeyId,  setOneKeyId]  = useState("");
  const [oneKeyPw,  setOneKeyPw]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [messages,  setMessages]  = useState<ChatMessage[]>([COMPLIANCE_GREETING]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const addMessage = (type: ChatMessage["type"], text: string) =>
    setMessages(prev => [...prev, { id: `${Date.now()}`, type, text }]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleVerify = () => {
    setAuthState("unlocked");
    setOneKeyId("");
    setOneKeyPw("");
    setShowPw(false);
    setTimeout(() => addMessage("bot", "Identity verified. How can we assist you with AstraZeneca therapeutic data today?"), 350);
  };

  const handleTimeout = () => {
    setAuthState("locked");
    setShowResponse(false);
    setShowMARedirect(false);
    setSelectedQuery("");
    addMessage("system", "Session expired due to inactivity. Please re-verify to continue.");
  };

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

  const handleConnectMedicalAffairs = () => onMedicalAffairs(selectedQuery);

  const newCount      = NEWS_ITEMS.filter(i => i.isNew).length;
  const filteredItems = NEWS_ITEMS.filter(i => activeFilter === "all" || i.category === activeFilter);
  const sectionItems  = (sec: NewsSection) => filteredItems.filter(i => i.section === sec);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div
          className="h-full p-8 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #4D9DE0 0%, #2563EB 50%, #1E40AF 100%)" }}
        >
          <div className="absolute inset-0 opacity-30" style={{
            background: "radial-gradient(circle at 30% 50%, rgba(59,130,246,0.5) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(96,165,250,0.4) 0%, transparent 50%)",
          }} />

          {/* Desktop Icons */}
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

          {/* ── OneKey Browser Window Simulation ──────────────────────────────── */}
          <AnimatePresence>
            {authState === "modal" && (
              <>
                {/* Scrim */}
                <motion.div
                  key="onekey-scrim"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[70]"
                />

                {/* Full browser window */}
                <motion.div
                  key="onekey-modal"
                  initial={{ scale: 0.94, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: 16 }}
                  transition={{ duration: 0.22 }}
                  className="absolute z-[80] rounded-xl overflow-hidden shadow-2xl flex flex-col"
                  style={{ width: 520, height: 530, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                >
                  {/* ── Tab bar ── */}
                  <div className="flex items-end px-3 pt-2 gap-0 bg-[#dee1e6] select-none">
                    {/* Active tab */}
                    <div className="flex items-center gap-1.5 bg-white rounded-t-lg px-3 py-1.5 text-[8px] text-gray-700 font-medium max-w-[200px]">
                      <Lock className="w-2.5 h-2.5 text-green-600 flex-shrink-0" />
                      <span className="truncate">IQVIA OneKey — Sign In</span>
                      <button onClick={() => setAuthState("locked")} className="ml-1 rounded-full p-0.5 hover:bg-gray-200 flex-shrink-0">
                        <X className="w-2 h-2 text-gray-500" />
                      </button>
                    </div>
                    <div className="mb-0.5 ml-1 w-5 h-5 rounded-full bg-[#dee1e6] hover:bg-gray-300 flex items-center justify-center cursor-pointer">
                      <span className="text-gray-500 text-sm leading-none pb-0.5">+</span>
                    </div>
                  </div>

                  {/* ── Browser chrome ── */}
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#f1f3f4] border-b border-gray-300 select-none">
                    {/* Traffic lights */}
                    <button onClick={() => setAuthState("locked")} className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors flex-shrink-0" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400 flex-shrink-0" />
                    <div className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0" />

                    {/* Nav buttons */}
                    <button className="ml-1 w-6 h-6 rounded flex items-center justify-center text-gray-400 opacity-40 cursor-default">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-6 h-6 rounded flex items-center justify-center text-gray-400 opacity-40 cursor-default">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 text-gray-500 transition-colors">
                      <RefreshCw className="w-3 h-3" />
                    </button>

                    {/* Address bar */}
                    <div className="flex-1 flex items-center gap-1.5 bg-white rounded-full px-3 py-1 border border-gray-300 shadow-sm">
                      <Lock className="w-2.5 h-2.5 text-green-600 flex-shrink-0" />
                      <span className="text-[8px] text-gray-600 font-mono flex-1 truncate">
                        https://onekey.iqvia.com/oauth2/authorize?client_id=az-bridge&scope=hcp_identity
                      </span>
                    </div>

                    <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 text-gray-400 transition-colors">
                      <Bookmark className="w-3 h-3" />
                    </button>
                    <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-200 text-gray-400 transition-colors">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* ── Website body ── */}
                  <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">

                    {/* Site nav bar */}
                    <div className="flex items-center justify-between px-6 py-2.5 flex-shrink-0" style={{ backgroundColor: "#1A2B4C" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center bg-white/10">
                          <KeyRound className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white font-bold text-[11px] tracking-widest uppercase">IQVIA</span>
                        <span className="text-white/40 text-[8px] border-l border-white/20 pl-2 ml-1">OneKey</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {["Solutions", "Support", "Contact"].map(l => (
                          <span key={l} className="text-white/50 text-[8px] cursor-pointer hover:text-white/80 transition-colors">{l}</span>
                        ))}
                      </div>
                    </div>

                    {/* Hero strip */}
                    <div className="px-6 py-4 text-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #0F1D35 0%, #1A3A6B 100%)" }}>
                      <p className="text-white font-semibold text-[11px] mb-1">Verify Your Healthcare Professional Identity</p>
                      <p className="text-white/50 text-[8px] leading-relaxed">
                        Secure access powered by IQVIA's global HCP reference database · Real Decreto 1416/1994 compliant
                      </p>
                    </div>

                    {/* Login card */}
                    <div className="flex-1 flex items-start justify-center pt-5 px-6 pb-4">
                      <div className="w-full max-w-[340px] bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">

                        {/* Card header */}
                        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gray-50">
                          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#1A2B4C" }}>
                            <Lock className="w-2.5 h-2.5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-semibold text-gray-800">Sign in with OneKey ID</p>
                            <p className="text-[7.5px] text-gray-400">AstraZeneca Medical Information Portal · Spain</p>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[7px] text-green-700 font-medium">Secure</span>
                          </div>
                        </div>

                        {/* Form */}
                        <div className="px-5 py-4 space-y-3">
                          <div>
                            <label className="block text-[9px] font-semibold text-gray-600 mb-1">OneKey ID / Email</label>
                            <input
                              type="email"
                              value={oneKeyId}
                              onChange={e => setOneKeyId(e.target.value)}
                              placeholder="hcp@hospital.es"
                              className="w-full px-3 py-2 text-[10px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-gray-50"
                              style={{ "--tw-ring-color": "#1A2B4C" } as React.CSSProperties}
                            />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <label className="text-[9px] font-semibold text-gray-600">Password</label>
                              <span className="text-[7.5px] text-blue-500 cursor-pointer hover:underline">Forgot password?</span>
                            </div>
                            <div className="relative">
                              <input
                                type={showPw ? "text" : "password"}
                                value={oneKeyPw}
                                onChange={e => setOneKeyPw(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") handleVerify(); }}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 text-[10px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-gray-50 pr-8"
                                style={{ "--tw-ring-color": "#1A2B4C" } as React.CSSProperties}
                              />
                              <button type="button" onClick={() => setShowPw(p => !p)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={handleVerify}
                            className="w-full py-2.5 rounded-lg text-[10px] font-semibold text-white transition-opacity hover:opacity-90 mt-1"
                            style={{ backgroundColor: "#1A2B4C" }}
                          >
                            Log In
                          </button>

                          <p className="text-center text-[7.5px] text-gray-400">
                            Don't have an account?{" "}
                            <span className="text-blue-500 cursor-pointer hover:underline">Request HCP access</span>
                          </p>
                        </div>

                        {/* Trust strip */}
                        <div className="px-5 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-4">
                          {[
                            { icon: Lock, label: "256-bit TLS", color: "text-green-600" },
                            { icon: ShieldCheck, label: "GDPR", color: "text-blue-500" },
                            { icon: ShieldCheck, label: "ISO 27001", color: "text-purple-500" },
                          ].map(({ icon: Icon, label, color }) => (
                            <div key={label} className="flex items-center gap-1">
                              <Icon className={`w-2.5 h-2.5 ${color}`} />
                              <span className="text-[7px] text-gray-400">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Site footer ── */}
                  <div className="flex items-center justify-between px-6 py-2 flex-shrink-0" style={{ backgroundColor: "#0F1D35" }}>
                    <span className="text-[7px] text-white/30">© 2026 IQVIA Inc. All rights reserved.</span>
                    <div className="flex items-center gap-3">
                      {["Privacy", "Terms", "Cookies"].map(l => (
                        <span key={l} className="text-[7px] text-white/30 cursor-pointer hover:text-white/60 transition-colors">{l}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Chat Widget ── */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                key="chat-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
                {authState === "locked" && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-white" />
                  </span>
                )}
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
                {/* ── Chat panel ── */}
                <div className="w-[380px] flex flex-col overflow-hidden flex-shrink-0">

                  {/* Header */}
                  <div
                    className="px-4 py-3 flex items-center justify-between flex-shrink-0"
                    style={{ backgroundColor: "#830051" }}
                  >
                    <div className="flex items-center gap-2">
                      {authState === "unlocked"
                        ? <ShieldCheck className="w-4 h-4 text-green-300 flex-shrink-0" />
                        : <ShieldAlert className="w-4 h-4 text-amber-300 flex-shrink-0" />
                      }
                      <div>
                        <span className="text-white font-semibold text-sm">AZ Scientific Exchange</span>
                        <p className="text-[9px] text-white/70 leading-none mt-0.5">
                          {authState === "unlocked" ? "Verified HCP session" : "Verification required"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Simulate Token Timeout — prototype testing control */}
                      {authState === "unlocked" && (
                        <button
                          onClick={handleTimeout}
                          title="Simulate Token Timeout"
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-[8px] font-medium bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all border border-white/20"
                        >
                          <Timer className="w-2.5 h-2.5" />
                          Simulate Timeout
                        </button>
                      )}

                      {/* News drawer toggle */}
                      <button
                        onClick={() => setIsDrawerOpen(o => !o)}
                        className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{ backgroundColor: isDrawerOpen ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)" }}
                        title="News & Updates"
                      >
                        <Bell className="w-3.5 h-3.5 text-white" />
                        {newCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-[6px] font-bold text-white flex items-center justify-center">
                            {newCount}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                    style={{ maxHeight: "300px", opacity: authState === "locked" ? 0.9 : 1 }}
                  >
                    {/* ── Chat message log (compliance greeting + transitions) ── */}
                    {messages.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl px-4 py-3 max-w-[92%] ${
                          msg.type === "system"
                            ? "bg-amber-50 border border-amber-200 text-amber-800 text-[10px] italic"
                            : "text-sm text-gray-800 leading-relaxed"
                        }`}
                        style={msg.type === "bot" ? { backgroundColor: "#f3e8f0", borderLeft: "3px solid #830051" } : {}}
                      >
                        {msg.type === "bot" && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#830051" }}>
                              <span className="text-[5px] text-white font-bold">AZ</span>
                            </div>
                            <span className="text-[8px] font-semibold" style={{ color: "#830051" }}>AZ Medical Info</span>
                          </div>
                        )}
                        {msg.type === "system" && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <ShieldAlert className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <span className="text-[8px] font-semibold text-amber-700">System Notice</span>
                          </div>
                        )}
                        <p className={msg.type === "system" ? "text-[10px]" : "text-xs leading-relaxed"}>
                          {msg.text}
                        </p>
                      </motion.div>
                    ))}

                    {/* ── Locked: Verify with OneKey CTA ── */}
                    {authState === "locked" && (
                      <motion.div
                        key="verify-cta"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <button
                          onClick={() => setAuthState("modal")}
                          className="w-full rounded-xl py-3 px-4 flex items-center justify-center gap-2.5 font-semibold text-sm text-white transition-all hover:opacity-90 shadow-md"
                          style={{ background: "linear-gradient(135deg, #1A2B4C 0%, #2563EB 100%)" }}
                        >
                          <KeyRound className="w-4 h-4 flex-shrink-0" />
                          Verify with OneKey
                          <span className="ml-auto text-[8px] font-normal text-white/60 bg-white/10 px-1.5 py-0.5 rounded">
                            IQVIA
                          </span>
                        </button>
                        <p className="text-center text-[7.5px] text-gray-400 mt-2">
                          Powered by IQVIA OneKey · HCP identity verification
                        </p>
                      </motion.div>
                    )}

                    {/* ── Unlocked: chat suggestion content ── */}
                    {authState === "unlocked" && (
                      <>
                        {!showResponse && !showMARedirect && (
                          <>
                            {quickQueries.map((query, idx) => (
                              <motion.button key={idx}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => {
                                  if (idx === 0) { setSelectedQuery(query); setShowMARedirect(true); }
                                  else { onChat(query); }
                                }}
                                className="w-full bg-gray-50 hover:bg-gray-100 rounded-xl p-3 text-left transition-colors border border-gray-200">
                                <div className="text-xs text-gray-700 leading-relaxed">{query}</div>
                              </motion.button>
                            ))}

                            <motion.button
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                              onClick={handleConnectMedicalAffairs}
                              className="w-full bg-blue-50 hover:bg-blue-100 rounded-xl p-3 flex items-center gap-3 transition-colors border border-blue-200">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#1D2B4F" }}>
                                <Clock className="w-4 h-4 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="text-xs font-medium" style={{ color: "#1D2B4F" }}>Pick up where you left off</div>
                                <div className="text-[9px] text-gray-500 mt-0.5">Continue your last conversation</div>
                              </div>
                            </motion.button>

                            <motion.button
                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                              onClick={handleConnectMedicalAffairs}
                              className="w-full rounded-xl p-3 flex items-center gap-3 border-2"
                              style={{ backgroundColor: "#830051", borderColor: "#830051" }}>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/20">
                                <Phone className="w-4 h-4 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="text-xs font-medium text-white">Connect to Medical Affairs</div>
                                <div className="text-[9px] text-white/80 mt-0.5">Speak directly with our medical team</div>
                              </div>
                            </motion.button>
                          </>
                        )}

                        {showMARedirect && (
                          <>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              className="bg-gray-100 rounded-2xl rounded-tr-sm p-3 ml-auto max-w-[85%]">
                              <div className="text-xs text-gray-800 leading-relaxed">{selectedQuery}</div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.25 }}
                              className="rounded-2xl rounded-tl-sm p-3 max-w-[85%] border border-amber-200 bg-amber-50">
                              <div className="flex items-start gap-2 mb-3">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: "#830051" }}>
                                  <svg viewBox="0 0 16 16" fill="none" className="w-2.5 h-2.5" stroke="white" strokeWidth="2" strokeLinecap="round">
                                    <path d="M8 7v4M8 5v.5" /><circle cx="8" cy="8" r="6" />
                                  </svg>
                                </div>
                                <p className="text-[10px] text-amber-900 leading-relaxed">
                                  This topic cannot be discussed within chat and should be directed to Medical Affairs.
                                </p>
                              </div>
                              <div className="space-y-2">
                                <button onClick={() => { setShowMARedirect(false); onMedicalAffairs(selectedQuery); }}
                                  className="w-full rounded-lg p-2 flex items-center justify-center gap-1.5 text-white text-xs"
                                  style={{ backgroundColor: "#830051" }}>
                                  <Phone className="w-3.5 h-3.5" /> Connect me to Medical Affairs
                                </button>
                                <button onClick={() => setShowMARedirect(false)}
                                  className="w-full rounded-lg p-2 flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-xs text-gray-700">
                                  No, I'll do it later
                                </button>
                              </div>
                            </motion.div>
                          </>
                        )}

                        {showResponse && !showMARedirect && (
                          <>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              className="bg-gray-100 rounded-2xl rounded-tr-sm p-3 ml-auto max-w-[85%]">
                              <div className="text-xs text-gray-800 leading-relaxed">{selectedQuery}</div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }} className="rounded-2xl rounded-tl-sm p-3 max-w-[85%]"
                              style={{ backgroundColor: "#830051" }}>
                              <div className="text-xs text-white leading-relaxed">
                                This is a great question that requires detailed medical expertise. This type of information is best discussed directly with our Medical Affairs team.
                              </div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                              <div className="text-xs text-amber-900 mb-3">Would you like us to connect you with Medical Affairs?</div>
                              <div className="space-y-2">
                                <button onClick={handleConnectMedicalAffairs}
                                  className="w-full rounded-lg p-2 flex items-center justify-center gap-1.5"
                                  style={{ backgroundColor: "#830051" }}>
                                  <Phone className="w-3.5 h-3.5 text-white" />
                                  <span className="text-xs text-white">Yes, connect me to Medical Affairs</span>
                                </button>
                                <button onClick={() => setShowResponse(false)}
                                  className="w-full rounded-lg p-2 flex items-center justify-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50">
                                  <MessageCircle className="w-3.5 h-3.5 text-gray-600" />
                                  <span className="text-xs text-gray-700">No, keep me in chat</span>
                                </button>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input bar */}
                  <div className={`border-t border-gray-200 p-3 flex-shrink-0 transition-colors ${authState !== "unlocked" ? "bg-gray-100" : "bg-gray-50"}`}>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={authState === "unlocked" ? inputValue : ""}
                        onChange={e => handleInputChange(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleSendMessage(); }}
                        disabled={authState !== "unlocked"}
                        placeholder={
                          authState === "unlocked"
                            ? "Type your medical inquiry here..."
                            : "Please verify your credentials to unlock chat."
                        }
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-xs transition-colors"
                        style={{
                          "--tw-ring-color": "#830051",
                          backgroundColor: authState !== "unlocked" ? "#f3f4f6" : "white",
                          borderColor: authState !== "unlocked" ? "#e5e7eb" : "#d1d5db",
                          color: authState !== "unlocked" ? "#9ca3af" : "inherit",
                          cursor: authState !== "unlocked" ? "not-allowed" : "text",
                        } as React.CSSProperties}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={authState !== "unlocked"}
                        className="px-3 py-2 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-40"
                        style={{ backgroundColor: authState === "unlocked" ? "#830051" : "#9ca3af" }}
                      >
                        <Send className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                    {authState !== "unlocked" && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Lock className="w-2.5 h-2.5 text-gray-400" />
                        <span className="text-[7px] text-gray-400">
                          Chat is locked until identity is verified via OneKey
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── News & Updates panel (right) ── */}
                <motion.div
                  animate={{ width: isDrawerOpen ? 260 : 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden flex-shrink-0 border-l border-gray-100"
                >
                  <div className="w-[260px] h-full flex flex-col relative">
                    {/* ── Locked overlay ── */}
                    <AnimatePresence>
                      {authState !== "unlocked" && (
                        <motion.div
                          key="news-lock"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="absolute inset-0 z-10 flex flex-col items-center justify-center"
                          style={{ background: "rgba(15,29,53,0.88)", backdropFilter: "blur(3px)" }}
                        >
                          <div className="flex flex-col items-center gap-3 text-center px-5">
                            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                              <Lock className="w-5 h-5 text-white/60" />
                            </div>
                            <div>
                              <p className="text-white text-xs font-semibold mb-1">News & Updates</p>
                              <p className="text-white/40 text-[8px] leading-relaxed">
                                Verify your identity to access news, conference alerts, and AZ announcements.
                              </p>
                            </div>
                            <button
                              onClick={() => setAuthState("modal")}
                              className="px-3 py-1.5 rounded-lg text-[8px] font-semibold text-white border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
                            >
                              Verify with OneKey
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ── News panel content (blurred while locked) ── */}
                    <div className={`flex flex-col h-full transition-all ${authState !== "unlocked" ? "blur-[2px] pointer-events-none" : ""}`}>
                    <div className="flex-shrink-0 px-3 py-3 border-b border-gray-200" style={{ backgroundColor: "#1D2B4F" }}>
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
                      <div className="flex items-center gap-1">
                        {(["all", "az", "conference", "news"] as FilterType[]).map(f => {
                          const newInF = NEWS_ITEMS.filter(i => (f === "all" ? true : i.category === f) && i.isNew).length;
                          return (
                            <button key={f} onClick={() => setActiveFilter(f)}
                              className="relative px-2 py-1 rounded-md text-[8px] font-medium transition-all flex items-center gap-0.5"
                              style={activeFilter === f ? { backgroundColor: "#830051", color: "white" } : { color: "rgba(255,255,255,0.5)" }}>
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
                    <div className="flex-1 overflow-y-auto p-2.5 bg-gray-50">
                      <NewsSectionBlock title="Upcoming Events"    icon={Calendar}  items={sectionItems("event")}        accentColor="#2196F3" />
                      <NewsSectionBlock title="Conference Updates" icon={Radio}      items={sectionItems("conference")}   accentColor="#2196F3" />
                      <NewsSectionBlock title="AZ Announcements"  icon={Megaphone}  items={sectionItems("announcement")} accentColor="#FFC107" />
                      <NewsSectionBlock title="Medical News"      icon={Newspaper}  items={sectionItems("medical")}      accentColor="#9E9E9E" />
                      {filteredItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <Bell className="w-7 h-7 text-gray-300 mb-2" />
                          <p className="text-[9px] text-gray-400">No updates in this category</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 px-3 py-2 border-t border-gray-100 bg-white flex items-center justify-between">
                      <span className="text-[7.5px] text-gray-400 font-mono">
                        {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
                        {filteredItems.filter(i => i.isNew).length > 0 ? ` · ${filteredItems.filter(i => i.isNew).length} new` : ""}
                      </span>
                      <button className="text-[7.5px] text-gray-400 hover:text-gray-600 transition-colors">
                        Mark all read
                      </button>
                    </div>
                    </div>{/* end blurred wrapper */}
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
