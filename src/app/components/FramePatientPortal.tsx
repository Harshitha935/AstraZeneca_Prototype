import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, FileText, Heart, ChevronRight, CheckCircle } from "lucide-react";

const ACCENT = "#0369a1";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  sources?: Resource[];
}

interface Resource {
  id: string;
  title: string;
  type: "leaflet" | "guide" | "faq";
}

const RESOURCE_SETS: Record<string, Resource[]> = {
  treatment: [
    { id: "r1", title: "Understanding Your Treatment", type: "leaflet" },
    { id: "r2", title: "How Targeted Therapy Works", type: "guide" },
  ],
  sideEffects: [
    { id: "r3", title: "Managing Side Effects Day to Day", type: "guide" },
    { id: "r4", title: "When to Contact Your Care Team", type: "faq" },
  ],
  appointment: [
    { id: "r5", title: "Preparing for Your Next Visit", type: "guide" },
    { id: "r6", title: "Questions to Ask Your Doctor", type: "faq" },
  ],
  lifestyle: [
    { id: "r7", title: "Nutrition During Treatment", type: "leaflet" },
    { id: "r8", title: "Staying Active — A Gentle Guide", type: "guide" },
  ],
};

const RESPONSES: Record<string, string> = {
  treatment:
    "Your care team has shared information about your treatment with us. Your therapy is designed to target specific pathways in cancer cells, helping to slow or stop their growth. It is tailored to your individual medical profile, and your physician will monitor how you are responding throughout. Adjustments can be made at any time. Remember — you are not going through this alone.",
  sideEffects:
    "It is completely normal to have questions about side effects. Your care team wants you to know about common effects such as tiredness, nausea, and temporary changes in blood counts — most of which can be managed effectively with support. Please contact your physician straight away if you experience anything severe or unexpected.",
  appointment:
    "Preparing well helps you get the most from your time with your care team. A few helpful tips: note any new symptoms since your last visit, bring your current medication list, and write down questions in advance so you don't forget. It can really help to bring a trusted friend or family member along too.",
  lifestyle:
    "Your care team recommends staying well hydrated, eating a balanced diet rich in vegetables and lean protein, and keeping active with light gentle movement when you feel well enough. It is best to avoid alcohol during treatment and to always check with your physician before starting any new supplements or vitamins.",
  default:
    "Thank you for your question. I can only share information from resources your care team has approved for you. For anything beyond that, your physician or care coordinator is the best person to help. Is there a specific topic from your approved resources I can help with?",
};

const QUICK_QUESTIONS = [
  { label: "About my treatment", key: "treatment" },
  { label: "Side effects to watch for", key: "sideEffects" },
  { label: "Preparing for my next visit", key: "appointment" },
  { label: "Diet and lifestyle tips", key: "lifestyle" },
];

function getResponse(input: string): { text: string; sources: Resource[] } {
  const q = input.toLowerCase();
  if (q.includes("treatment") || q.includes("therapy") || q.includes("drug") || q.includes("medication") || q.includes("medicine"))
    return { text: RESPONSES.treatment, sources: RESOURCE_SETS.treatment };
  if (q.includes("side effect") || q.includes("symptom") || q.includes("tired") || q.includes("nausea") || q.includes("pain") || q.includes("feel"))
    return { text: RESPONSES.sideEffects, sources: RESOURCE_SETS.sideEffects };
  if (q.includes("appointment") || q.includes("visit") || q.includes("doctor") || q.includes("prepare") || q.includes("question"))
    return { text: RESPONSES.appointment, sources: RESOURCE_SETS.appointment };
  if (q.includes("diet") || q.includes("food") || q.includes("exercise") || q.includes("lifestyle") || q.includes("eat") || q.includes("active"))
    return { text: RESPONSES.lifestyle, sources: RESOURCE_SETS.lifestyle };
  return { text: RESPONSES.default, sources: [] };
}

const TYPE_ICON: Record<Resource["type"], string> = {
  leaflet: "Patient Leaflet",
  guide: "Care Guide",
  faq: "FAQ Sheet",
};

export function FramePatientPortal() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", text: text.trim() }]);
    setInput("");
    setStarted(true);
    setTyping(true);
    setTimeout(() => {
      const { text: responseText, sources } = getResponse(text);
      setTyping(false);
      setMessages(prev => [...prev, { id: `b-${Date.now()}`, role: "bot", text: responseText, sources }]);
    }, 900);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#f8fafc]">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#830051" }}
        >
          <span className="text-white text-[10px] font-bold tracking-tight">AZ</span>
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight" style={{ color: "#1D2B4F" }}>
            Patient Portal
          </p>
          <p className="text-[8px] font-medium" style={{ color: ACCENT }}>
            Resources from your care team
          </p>
        </div>
        <div
          className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
          style={{ backgroundColor: "#f0f9ff", borderColor: "rgba(3,105,161,0.22)" }}
        >
          <Heart className="w-3 h-3" style={{ color: ACCENT }} />
          <span className="text-[8px] font-medium" style={{ color: ACCENT }}>Patient Access</span>
        </div>
      </div>

      {/* Care team banner */}
      <div
        className="px-6 py-2 flex items-center gap-2 flex-shrink-0"
        style={{ backgroundColor: "#f0f9ff", borderBottom: "1px solid rgba(3,105,161,0.12)" }}
      >
        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: ACCENT }} />
        <p className="text-[9px]" style={{ color: ACCENT }}>
          <span className="font-semibold">
            This assistant only shares information your care team has approved for you.
          </span>{" "}
          For urgent concerns, contact your physician directly.
        </p>
      </div>

      {/* Chat area */}
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
            <p className="text-sm text-gray-700 leading-relaxed">
              Hello! I'm here to help you find information from the resources
              your care team has shared with you. What would you like to know?
            </p>
          </div>
        </motion.div>

        {/* Quick question chips — visible before first message */}
        <AnimatePresence>
          {!started && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ delay: 0.15 }}
              className="flex gap-3"
            >
              <div className="w-8 flex-shrink-0" />
              <div className="flex flex-col gap-2 w-full max-w-sm">
                {QUICK_QUESTIONS.map((q, i) => (
                  <motion.button
                    key={q.key}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    onClick={() => send(q.label)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left border transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: "#f0f9ff",
                      borderColor: "rgba(3,105,161,0.2)",
                    }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-[10px] font-medium text-gray-700">{q.label}</span>
                    <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversation */}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
              style={
                msg.role === "user"
                  ? { backgroundColor: "#dbeafe" }
                  : { backgroundColor: "#1D2B4F" }
              }
            >
              {msg.role === "user"
                ? <User className="w-4 h-4" style={{ color: ACCENT }} />
                : <Bot className="w-4 h-4 text-white" />}
            </div>

            <div className={`${msg.role === "user" ? "max-w-sm" : "flex-1 max-w-lg"}`}>
              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === "user"
                    ? "rounded-tr-sm"
                    : "rounded-tl-sm bg-white border border-gray-100"
                }`}
                style={msg.role === "user" ? { backgroundColor: ACCENT } : {}}
              >
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: msg.role === "user" ? "#ffffff" : "#374151" }}
                >
                  {msg.text}
                </p>
              </div>

              {/* Approved resource cards */}
              {msg.sources && msg.sources.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="mt-2 space-y-1.5"
                >
                  {msg.sources.map((src) => (
                    <div
                      key={src.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                      style={{
                        backgroundColor: "#f0fdf4",
                        borderColor: "rgba(22,163,74,0.22)",
                      }}
                    >
                      <FileText className="w-3 h-3 flex-shrink-0 text-emerald-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-semibold text-gray-800 leading-tight">
                          {src.title}
                        </p>
                        <p className="text-[7px] text-gray-400 mt-0.5">{TYPE_ICON[src.type]}</p>
                      </div>
                      <span className="text-[7px] font-bold text-emerald-600 whitespace-nowrap">
                        ✓ Care Team Approved
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
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
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gray-300"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask a question about your care…"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": ACCENT } as React.CSSProperties}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || typing}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all"
            style={{ backgroundColor: ACCENT }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[8px] text-gray-400 mt-2 text-center">
          Responses are based only on resources shared by your care team
        </p>
      </div>
    </div>
  );
}
