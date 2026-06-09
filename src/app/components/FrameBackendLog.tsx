import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, X, Database, Shield, Wifi } from "lucide-react";
import { getLog, clearLog, subscribe, LogEntry, PortalType, AccessResult } from "../lib/activityLog";

const PORTAL_STYLE: Record<PortalType, { bg: string; text: string; border: string; label: string }> = {
  open:    { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   label: "OPEN"    },
  student: { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200",   label: "STUDENT" },
  hcp:     { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "HCP"     },
  patient: { bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200",    label: "PATIENT" },
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

  // Live-update: subscribe to logEvent / clearLog so the table reflects
  // events from whichever portal the user interacted with, in real time.
  useEffect(() => {
    const unsub = subscribe(() => setEntries([...getLog()]));
    return unsub;
  }, []);

  const total    = entries.length;
  const byPortal: Record<PortalType, number> = {
    open:    entries.filter(e => e.portalType === "open").length,
    student: entries.filter(e => e.portalType === "student").length,
    hcp:     entries.filter(e => e.portalType === "hcp").length,
    patient: entries.filter(e => e.portalType === "patient").length,
  };
  const gated    = entries.filter(e => e.accessResult.startsWith("gated")).length;
  const answered = entries.filter(e => e.accessResult.startsWith("answered")).length;

  const portalsUsed = (Object.entries(byPortal) as [PortalType, number][]).filter(([, n]) => n > 0);

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
              Unified cross-portal event trail · Updates in real time · No personal identifiers stored
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/20">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <Wifi className="w-2.5 h-2.5 text-green-400" />
              <span className="text-[9px] text-green-300 font-medium">Live</span>
            </div>
            <button
              onClick={() => { clearLog(); }}
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
          {/* Show only portals that have events; if none yet show all */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(portalsUsed.length > 0 ? portalsUsed : (Object.entries(byPortal) as [PortalType, number][])).map(([pt, n]) => {
              const s = PORTAL_STYLE[pt];
              return (
                <Badge key={pt} label={`${s.label}  ${n}`} bg={s.bg} text={s.text} border={s.border} />
              );
            })}
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
                  Interact with any portal to generate log entries
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
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0, backgroundColor: "rgba(131,0,81,0.06)" }}
                        animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0)" }}
                        transition={{ duration: 0.6 }}
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
                      </motion.tr>
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
