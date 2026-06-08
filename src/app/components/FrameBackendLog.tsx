import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, Trash2, X, Database, Shield } from "lucide-react";
import { getLog, clearLog, LogEntry, PortalType, AccessResult } from "../lib/activityLog";

const PORTAL_STYLE: Record<PortalType, { bg: string; text: string; border: string; label: string }> = {
  open:    { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   label: "OPEN"    },
  student: { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200",   label: "STUDENT" },
  hcp:     { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "HCP"     },
};

const RESULT_STYLE: Record<AccessResult, { bg: string; text: string; label: string }> = {
  "gated_registration_required": { bg: "bg-red-50",    text: "text-red-700",    label: "Gated · Registration" },
  "gated_out_of_scope":          { bg: "bg-amber-50",  text: "text-amber-700",  label: "Gated · Out of Scope" },
  "answered_light_search":       { bg: "bg-blue-50",   text: "text-blue-700",   label: "Answered · Light"     },
  "answered_medium_search":      { bg: "bg-teal-50",   text: "text-teal-700",   label: "Answered · Medium"    },
  "answered_deep_search":        { bg: "bg-green-50",  text: "text-green-700",  label: "Answered · Deep"      },
  "n/a":                         { bg: "bg-gray-50",   text: "text-gray-500",   label: "—"                    },
};

const ACTION_LABEL: Record<string, string> = {
  demo_query_click: "Demo query clicked",
  query_submit:     "Query submitted",
  results_shown:    "Results shown",
  cta_dismiss:      "CTA dismissed",
  copy_answer:      "Answer copied",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function Badge({ label, bg, text, border }: { label: string; bg: string; text: string; border?: string }) {
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-semibold ${bg} ${text} ${border ? `border ${border}` : ""}`}>
      {label}
    </span>
  );
}

interface Props { onClose: () => void; }

export function FrameBackendLog({ onClose }: Props) {
  const [entries, setEntries] = useState<readonly LogEntry[]>(() => getLog());

  const refresh = () => setEntries([...getLog()]);
  const clear   = () => { clearLog(); setEntries([]); };

  const total    = entries.length;
  const byPortal = {
    open:    entries.filter(e => e.portalType === "open").length,
    student: entries.filter(e => e.portalType === "student").length,
    hcp:     entries.filter(e => e.portalType === "hcp").length,
  };
  const gated    = entries.filter(e => e.accessResult.startsWith("gated")).length;
  const answered = entries.filter(e => e.accessResult.startsWith("answered")).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-start justify-center px-8 pt-8 pb-8"
    >
      <motion.div
        initial={{ y: 24, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.97 }}
        className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "calc(100vh - 64px)" }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-3 bg-[#1D2B4F] flex-shrink-0">
          <Database className="w-4 h-4 text-white/50 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">AZBridge · Activity Log</p>
            <p className="text-[9px] text-white/40">
              Anonymous retrieval and interaction trail · No personal identifiers stored
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
            <button
              onClick={clear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
            <button onClick={onClose} className="ml-1 text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-4 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-gray-400">Total events</span>
            <span className="text-sm font-bold text-gray-800">{total}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Badge label={`Open  ${byPortal.open}`}    bg="bg-blue-50"   text="text-blue-700"   border="border-blue-200" />
            <Badge label={`Student  ${byPortal.student}`} bg="bg-teal-50" text="text-teal-700" border="border-teal-200" />
            <Badge label={`HCP  ${byPortal.hcp}`}      bg="bg-purple-50" text="text-purple-700" border="border-purple-200" />
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Badge label={`Gated  ${gated}`}    bg="bg-red-50"   text="text-red-700" />
            <Badge label={`Answered  ${answered}`} bg="bg-green-50" text="text-green-700" />
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-gray-300" />
            <span className="text-[8px] text-gray-400">No personal identifiers stored</span>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {entries.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-48 text-gray-400"
              >
                <Database className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm font-medium">No events yet</p>
                <p className="text-[10px] mt-1 text-gray-400">
                  Interact with the portal to generate log entries
                </p>
              </motion.div>
            ) : (
              <motion.table key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {["#", "Timestamp", "Session ID", "Portal", "Action", "Query", "Access Result", "Search Mode", "Sources"].map(h => (
                      <th
                        key={h}
                        className="px-3 py-2 text-[8px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...entries].reverse().map((entry, i) => {
                    const ps = PORTAL_STYLE[entry.portalType];
                    const rs = RESULT_STYLE[entry.accessResult];
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-3 py-2.5 text-[9px] text-gray-400">
                          {entries.length - i}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <p className="text-[9px] font-medium text-gray-700">{formatTime(entry.timestamp)}</p>
                          <p className="text-[8px] text-gray-400">{formatDate(entry.timestamp)}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[9px] font-mono text-gray-500">{entry.sessionId}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge label={ps.label} bg={ps.bg} text={ps.text} border={ps.border} />
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="text-[9px] text-gray-600">{ACTION_LABEL[entry.action] ?? entry.action}</span>
                        </td>
                        <td className="px-3 py-2.5 max-w-[220px]">
                          <p className="text-[9px] text-gray-700 truncate" title={entry.query}>
                            {entry.query}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <Badge label={rs.label} bg={rs.bg} text={rs.text} />
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="text-[9px] text-gray-600">{entry.searchMode}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-[9px] font-semibold text-gray-700">{entry.sourcesReturned}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </motion.table>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
