import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Calendar, Bell, ExternalLink } from "lucide-react";

interface Event {
  title: string;
  date: string;
  type: "congress" | "conference" | "regulatory";
  tags: string[];
}

const upcomingEvents: Event[] = [
  {
    title: "ESMO Congress 2026",
    date: "Sep 8-12, 2026",
    type: "congress",
    tags: ["AZ Presence", "High Interest"],
  },
  {
    title: "EHA Independent Symposium",
    date: "Jul 20, 2026",
    type: "conference",
    tags: ["Oncology Focus"],
  },
  {
    title: "EMA Regulatory Update",
    date: "Jun 15, 2026",
    type: "regulatory",
    tags: ["Comply", "Action Required"],
  },
];

const chatMessages = [
  {
    role: "hcp",
    content: "What are the latest data on combining targeted therapy with immunotherapy in advanced NSCLC?",
    time: "14:28",
  },
  {
    role: "system",
    content: "Based on your profile: Scientific Exchange, Treatment Guidelines, Real-World Evidence",
    time: "14:28",
  },
  {
    role: "ai",
    content: "Recent trials have shown promising results for combination approaches. The Phase III POSEIDON trial demonstrated improved PFS with durvalumab + chemotherapy vs. chemotherapy alone (HR 0.74).",
    time: "14:29",
    sources: ["NEJM 2026", "ESMO Abstract 2025"],
  },
];

export function HCPChat() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <AnimatePresence>
          {!isExpanded ? (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setIsExpanded(true)}
              className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--az-mulberry)" }}
            >
              <MessageCircle className="w-7 h-7 text-white" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                3
              </div>
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{ height: "680px" }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: "var(--az-mulberry)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white">AZ BridgeOS</h3>
                    <p className="text-sm text-white/80 mt-0.5">Your scientific companion</p>
                  </div>
                  <button onClick={() => setIsExpanded(false)} className="text-white/80 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Events Section */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" style={{ color: "var(--az-mulberry)" }} />
                  <span className="text-sm text-gray-700">Upcoming Events</span>
                </div>
                <div className="space-y-2">
                  {upcomingEvents.map((event, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm text-gray-900">{event.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{event.date}</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-2 mt-1" />
                      </div>
                      <div className="flex gap-1 mt-2">
                        {event.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: tag.includes("AZ") || tag.includes("Comply") ? "#fef3c7" : "#f3f4f6", color: tag.includes("AZ") || tag.includes("Comply") ? "#92400e" : "#4b5563" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                    {message.role === "system" ? (
                      <div className="flex justify-center">
                        <div className="bg-purple-50 rounded-lg px-3 py-2 text-xs text-gray-600 max-w-[85%] text-center border border-purple-100">
                          <Bell className="w-3 h-3 inline mr-1" style={{ color: "var(--az-mulberry)" }} />
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className={`flex ${message.role === "hcp" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-xl px-4 py-2.5 ${message.role === "hcp" ? "bg-gray-100" : "bg-[var(--az-mulberry)] text-white"}`}>
                          <div className="text-sm leading-relaxed">{message.content}</div>
                          {message.sources && (
                            <div className="mt-2 pt-2 border-t border-white/20">
                              <div className="text-xs opacity-80 mb-1">Sources:</div>
                              {message.sources.map((source) => (
                                <div key={source} className="text-xs opacity-90">
                                  • {source}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="text-xs opacity-70 mt-1.5">{message.time}</div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Suggestion Prompt */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-center">
                  <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-900 max-w-[90%] border border-blue-100">
                    💡 We noticed strong interest in <span className="font-medium">immunotherapy combinations</span> — want to explore related content?
                  </div>
                </motion.div>
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex gap-2">
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ask a scientific question..." className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--az-mulberry)] text-sm bg-gray-50" />
                  <button className="px-4 py-2 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--az-mulberry)", color: "#ffffff" }}>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-2 text-center">Powered by AZ Medical Affairs</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
