import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Database, Shield, Trash2 } from "lucide-react";
import { getLog, clearLog, subscribe, LogEntry, PortalType, AccessResult } from "../lib/activityLog";

interface Frame6Props {
  onNavigate: () => void;
}

const PORTAL_STYLE: Record<PortalType, { bg: string; text: string; border: string; dot: string; label: string }> = {
  open:    { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-400",   label: "OPEN"    },
  student: { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200",   dot: "bg-teal-500",   label: "STUDENT" },
  hcp:     { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500", label: "HCP"     },
  patient: { bg: "bg-sky-50",    text: "text-sky-700",    border: "border-sky-200",    dot: "bg-sky-400",    label: "PATIENT" },
};

const RESULT_STYLE: Record<AccessResult, { bg: string; text: string; label: string }> = {
  "gated_registration_required": { bg: "bg-red-100",   text: "text-red-700",    label: "Gated · Registration" },
  "gated_out_of_scope":          { bg: "bg-amber-100", text: "text-amber-700",  label: "Gated · Out of Scope" },
  "answered_light_search":       { bg: "bg-blue-100",  text: "text-blue-700",   label: "Answered · Light"     },
  "answered_medium_search":      { bg: "bg-teal-100",  text: "text-teal-700",   label: "Answered · Medium"    },
  "answered_deep_search":        { bg: "bg-green-100", text: "text-green-700",  label: "Answered · Deep"      },
  "n/a":                         { bg: "bg-gray-100",  text: "text-gray-500",   label: "—"                    },
};

const ACTION_LABEL: Record<string, string> = {
  demo_query_click: "Demo query clicked",
  query_submit:     "Query submitted",
  results_shown:    "Results shown",
  cta_dismiss:      "CTA dismissed",
  copy_answer:      "Answer copied",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function Badge({ label, bg, text, border }: { label: string; bg: string; text: string; border?: string }) {
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-semibold ${bg} ${text} ${border ? `border ${border}` : ""}`}>
      {label}
    </span>
  );
}

function LiveRow({ entry, index, total }: { entry: LogEntry; index: number; total: number }) {
  const ps = PORTAL_STYLE[entry.portalType];
  const rs = RESULT_STYLE[entry.accessResult];
  const isGated = entry.accessResult.startsWith("gated");

  return (
    <motion.tr
      initial={{ opacity: 0, backgroundColor: "rgba(131,0,81,0.08)" }}
      animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0)" }}
      transition={{ duration: 0.7 }}
      className={`border-b transition-colors ${isGated ? "bg-red-50/40 border-red-100 hover:bg-red-50/70" : "border-gray-100 hover:bg-gray-50/60"}`}
    >
      <td className="px-3 py-2.5 text-[9px] text-gray-400 font-mono">{total - index}</td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <p className="text-[9px] font-medium text-gray-700 font-mono">{formatTime(entry.timestamp)}</p>
      </td>
      <td className="px-3 py-2.5">
        <span className="text-[8px] font-mono text-gray-400">{entry.sessionId}</span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${ps.dot}`} />
          <Badge label={ps.label} bg={ps.bg} text={ps.text} border={ps.border} />
        </div>
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap">
        <span className="text-[9px] text-gray-600">{ACTION_LABEL[entry.action] ?? entry.action}</span>
      </td>
      <td className="px-3 py-2.5 max-w-[240px]">
        <p className="text-[9px] text-gray-700 truncate font-mono" title={entry.query}>{entry.query}</p>
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
}

export function Frame6PatientSignal({ onNavigate }: Frame6Props) {
  const [entries, setEntries] = useState<readonly LogEntry[]>(() => getLog());

  useEffect(() => {
    const unsub = subscribe(() => setEntries([...getLog()]));
    return unsub;
  }, []);

  const reversed = [...entries].reverse();

  const portalsActive = ([...new Set(entries.map(e => e.portalType))] as PortalType[]);
  const gated = entries.filter(e => e.accessResult.startsWith("gated")).length;
  const answered = entries.filter(e => e.accessResult.startsWith("answered")).length;

  return (
    <div className="h-full bg-[#F5F5F7] flex flex-col overflow-hidden">

      {/* Dark header */}
      <div className="bg-[#0F1923] px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#830051" }}>
            <Database className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-semibold tracking-wide">AZBridge · Activity Log</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono text-white" style={{ backgroundColor: "#830051" }}>
                LIVE · UNIFIED
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-gray-400 font-mono">{entries.length} events across {portalsActive.length} portal{portalsActive.length !== 1 ? "s" : ""}</span>
              <span className="text-gray-600">·</span>
              <motion.span
                className="text-[9px] text-green-400 font-mono flex items-center gap-1"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> LIVE
              </motion.span>
              <span className="text-gray-600">·</span>
              <span className="text-[9px] text-gray-400">No personal identifiers stored</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Per-portal event counts */}
          <div className="flex items-center gap-1.5">
            {portalsActive.map(pt => {
              const s = PORTAL_STYLE[pt];
              const n = entries.filter(e => e.portalType === pt).length;
              return <Badge key={pt} label={`${s.label} ${n}`} bg={s.bg} text={s.text} border={s.border} />;
            })}
          </div>

          <div className="w-px h-5 bg-white/10" />

          <button
            onClick={() => { clearLog(); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] text-red-300 transition-colors"
            style={{ backgroundColor: "rgba(239,68,68,0.15)" }}
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="bg-[#1A2535] px-6 py-2 flex items-center gap-4 flex-shrink-0 flex-wrap border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-gray-500" />
          <span className="text-[9px] text-gray-400">Total events</span>
          <span className="text-[11px] font-bold text-white">{entries.length}</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-900/60 text-red-300">Gated {gated}</span>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-900/60 text-green-300">Answered {answered}</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="bg-[#1D2B4F] px-3 py-2 flex-shrink-0 border-b border-white/10">
        <table className="w-full">
          <thead>
            <tr>
              {["#", "Timestamp", "Session", "Portal", "Action", "Query", "Access Result", "Search Mode", "Sources"].map(h => (
                <th key={h} className="px-3 py-0 text-left text-[8px] font-semibold text-white/40 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      {/* Live log table */}
      <div className="flex-1 overflow-y-auto bg-white">
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
              <p className="text-[10px] mt-1">Interact with any portal to see events appear here in real time</p>
            </motion.div>
          ) : (
            <motion.table key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-left border-collapse">
              <tbody>
                {reversed.map((entry, i) => (
                  <LiveRow key={entry.id} entry={entry} index={i} total={entries.length} />
                ))}
              </tbody>
            </motion.table>
          )}
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {portalsActive.map(pt => {
            const s = PORTAL_STYLE[pt];
            const n = entries.filter(e => e.portalType === pt).length;
            return (
              <div key={pt} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <span className={`text-[9px] font-medium ${s.text}`}>{s.label}: {n} events</span>
              </div>
            );
          })}
          {portalsActive.length === 0 && (
            <span className="text-[9px] text-gray-400">Waiting for portal interactions…</span>
          )}
        </div>
        <button
          onClick={onNavigate}
          className="px-5 py-2 rounded-lg text-white flex items-center gap-2 text-xs flex-shrink-0"
          style={{ backgroundColor: "#830051" }}
        >
          Intelligence Analysis
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
