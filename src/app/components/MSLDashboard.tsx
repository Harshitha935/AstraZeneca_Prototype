import { useState } from "react";
import { KnowledgeGraph, KnowledgeNode } from "./KnowledgeGraph";
import { motion } from "motion/react";
import { Send, TrendingUp, TrendingDown, Minus } from "lucide-react";

const mockNodes: KnowledgeNode[] = [
  { id: "1", label: "Scientific Exchange", score: "positive", x: 200, y: 50 },
  { id: "2", label: "Product Information", score: "positive", x: 310, y: 120 },
  { id: "3", label: "Adverse Events", score: "negative", x: 340, y: 230, pullUpstream: true },
  { id: "4", label: "Unmet Needs", score: "neutral", x: 280, y: 330 },
  { id: "5", label: "Treatment Guidelines", score: "positive", x: 160, y: 360 },
  { id: "6", label: "Real-World Evidence", score: "neutral", x: 60, y: 300 },
  { id: "7", label: "Patient Outcomes", score: "positive", x: 40, y: 190 },
  { id: "8", label: "Competitor Context", score: "neutral", x: 90, y: 90 },
];

interface Message {
  role: "hcp" | "system" | "msl";
  content: string;
  timestamp: string;
  nodes?: string[];
}

const mockMessages: Message[] = [
  {
    role: "hcp",
    content: "Can you provide updated information on the efficacy data from the recent Phase III trial?",
    timestamp: "14:32",
  },
  {
    role: "system",
    content: "Retrieved: Latest Phase III results (Published March 2026, NEJM)",
    timestamp: "14:32",
    nodes: ["Scientific Exchange", "Real-World Evidence"],
  },
  {
    role: "msl",
    content: "The Phase III trial demonstrated a significant improvement in progression-free survival (HR 0.68, p<0.001). Key endpoints included...",
    timestamp: "14:33",
  },
  {
    role: "hcp",
    content: "How does this compare to the competitor product in the same indication?",
    timestamp: "14:34",
  },
  {
    role: "system",
    content: "Cross-referencing competitor data and head-to-head analyses",
    timestamp: "14:34",
    nodes: ["Competitor Context", "Treatment Guidelines"],
  },
];

export function MSLDashboard() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">MSL Agent Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Dr. Sarah Chen - Oncology MSL | Session #4721</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Active Session Duration</div>
              <div style={{ color: "var(--az-mulberry)" }}>23:45</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Knowledge Graph */}
        <div className="w-[480px] border-r border-gray-200 p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-gray-900 mb-1">Live Knowledge Graph</h2>
            <p className="text-sm text-gray-500">Real-time interaction context mapping</p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <KnowledgeGraph nodes={mockNodes} size="large" />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
              <span className="text-gray-600">Positive contribution</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
              <span className="text-gray-600">Neutral</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
              <span className="text-gray-600">Needs attention</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat Interface */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {mockMessages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {message.role === "system" ? (
                  <div className="flex justify-center">
                    <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-600 max-w-md text-center">
                      <div>{message.content}</div>
                      {message.nodes && (
                        <div className="mt-2 flex flex-wrap gap-1 justify-center">
                          {message.nodes.map((node) => (
                            <span key={node} className="inline-flex items-center px-2 py-0.5 rounded text-xs" style={{ backgroundColor: "var(--az-mulberry)", color: "#ffffff" }}>
                              {node}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`flex ${message.role === "hcp" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[70%] rounded-lg px-4 py-3 ${message.role === "hcp" ? "bg-gray-100" : "bg-[var(--az-mulberry)] text-white"}`}>
                      <div className="text-xs opacity-70 mb-1">{message.role === "hcp" ? "HCP" : "MSL"} · {message.timestamp}</div>
                      <div className="text-sm leading-relaxed">{message.content}</div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type response or query AI assistant..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--az-mulberry)] bg-white"
              />
              <button className="px-6 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: "var(--az-mulberry)", color: "#ffffff" }}>
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Session Metrics */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Session Scoring Summary</div>
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm">Scientific Exchange +12</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm">Product Info +8</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm">Adverse Events -3</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="w-4 h-4 text-amber-600" />
              <span className="text-sm">Competitor Context 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
