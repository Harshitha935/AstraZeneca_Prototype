import { useState } from "react";
import { FramePatientPortal } from "./components/FramePatientPortal";
import { Frame1SignalEntry } from "./components/Frame1SignalEntry";
import { Frame1PortalLanding } from "./components/Frame1PortalLanding";
import { Frame2MedicalAffairsPortal } from "./components/Frame2MedicalAffairsPortal";
import { Frame3KnowledgeGraph } from "./components/Frame3KnowledgeGraph";
import { Frame4GraphAccumulates } from "./components/Frame4GraphAccumulates";
import { Frame5MSLWorkflow } from "./components/Frame5MSLWorkflow";
import { Frame6PatientSignal } from "./components/Frame6PatientSignal";
import { Frame7Intelligence } from "./components/Frame7Intelligence";
import { Frame8Analytics } from "./components/Frame8Analytics";
import { Frame8HCPChat } from "./components/Frame8HCPChat";
import type { PortalType } from "./components/Frame8HCPChat";
import { Frame9Executive } from "./components/Frame9Executive";
import { motion, AnimatePresence } from "motion/react";

type Frame = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const FRAME_LABELS: Record<number, string> = {
  1: "Signal Entry",
  2: "MA Portal",
  3: "Knowledge Graph",
  4: "SNS Log",
  5: "Research Response",
  6: "Access Log",
  7: "Intelligence",
  8: "Analytics",
  9: "Executive",
};


export default function App() {
  const [currentFrame, setCurrentFrame] = useState<Frame>(1);
  const [chatQuery, setChatQuery] = useState<string>("");
  const [portalType, setPortalType] = useState<PortalType>("hcp");
  const goTo = (frame: Frame, query?: string) => {
    if (query !== undefined) setChatQuery(query);
    setCurrentFrame(frame);
  };

  return (
    <div className="size-full flex flex-col bg-white">
      {/* ── Header ── */}
      <div className="border-b border-gray-200 px-5 py-2 bg-white flex items-center gap-4 flex-shrink-0">
        <div className="flex-shrink-0">
          <h1 className="text-base leading-tight" style={{ color: "#830051" }}>AZBridge</h1>
          <p className="text-[9px] text-gray-400">Signal Flow Prototype</p>
        </div>

        <div className="w-px h-7 bg-gray-200 flex-shrink-0" />

        {/* Nav dots */}
        <div className="flex items-center gap-1">
          {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Frame[]).map((frame) => (
            <button
              key={frame}
              onClick={() => setCurrentFrame(frame)}
              title={FRAME_LABELS[frame]}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] transition-all ${
                currentFrame === frame ? "text-white" : "text-gray-400 hover:bg-gray-100"
              }`}
              style={currentFrame === frame ? { backgroundColor: "#830051" } : {}}
            >
              {frame}
            </button>
          ))}
        </div>

        <div className="w-px h-7 bg-gray-200 flex-shrink-0" />

        {/* Reset */}
        <button onClick={() => setCurrentFrame(1)} title="Back to start"
          className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all flex-shrink-0">
          <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 8A5 5 0 1 1 8 3" /><path d="M8 1l2.5 2L8 5" />
          </svg>
        </button>

        <div className="w-px h-7 bg-gray-200 flex-shrink-0" />

        {/* Portal selector */}
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
          {(["open", "student", "patient", "hcp"] as PortalType[]).map((type) => (
            <button
              key={type}
              onClick={() => setPortalType(type)}
              className={`px-2.5 py-1 rounded-md text-[9px] font-medium transition-all ${
                portalType === type
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {type === "open" ? "Open" : type === "student" ? "Student" : type === "patient" ? "Patient" : "Registered HCP"}
            </button>
          ))}
        </div>

        {/* Portal variant badges */}
        {portalType === "student" && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-teal-50 border border-teal-200 flex-shrink-0">
            <span className="text-[8px] text-teal-700 font-medium">Student Version</span>
          </div>
        )}
        {portalType === "patient" && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-sky-50 border border-sky-200 flex-shrink-0">
            <span className="text-[8px] text-sky-700 font-medium">Patient Portal</span>
          </div>
        )}

        {/* Path indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {portalType === "patient" ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span className="text-[9px] text-sky-700 font-medium">Care team–approved resources</span>
            </div>
          ) : currentFrame <= 4 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <span className="text-[9px] text-purple-700 font-medium">Medical Affairs path</span>
            </div>
          ) : currentFrame <= 6 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[9px] text-blue-700 font-medium">Chat / Research path</span>
            </div>
          ) : currentFrame === 8 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[9px] text-green-700 font-medium">Analytics · No PII</span>
            </div>
          ) : currentFrame === 9 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[9px] text-amber-700 font-medium">Executive Intelligence</span>
            </div>
          ) : null}
          <span className="text-[10px] font-semibold text-gray-500">{FRAME_LABELS[currentFrame]}</span>
        </div>
      </div>

      {/* ── Frame content ── */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentFrame === 1 && (
            <motion.div key={`f1-${portalType}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              {portalType === "hcp" ? (
                <Frame1SignalEntry
                  onMedicalAffairs={(query) => goTo(2, query)}
                  onChat={(query) => goTo(5, query)}
                  portalType={portalType}
                />
              ) : portalType === "patient" ? (
                <FramePatientPortal />
              ) : (
                <Frame1PortalLanding
                  portalType={portalType}
                  onChat={(query) => goTo(5, query)}
                  onMedicalAffairs={(query) => goTo(2, query)}
                />
              )}
            </motion.div>
          )}
          {currentFrame === 2 && (
            <motion.div key="f2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              <Frame2MedicalAffairsPortal initialQuery={chatQuery} onNavigate={() => goTo(3)} />
            </motion.div>
          )}
          {currentFrame === 3 && (
            <motion.div key="f3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              <Frame3KnowledgeGraph onNavigate={() => goTo(4)} />
            </motion.div>
          )}
          {currentFrame === 4 && (
            <motion.div key="f4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              <Frame4GraphAccumulates onNavigate={() => goTo(1)} />
            </motion.div>
          )}
          {currentFrame === 5 && (
            <motion.div key={`f5-${portalType}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              {portalType === "hcp" ? (
                <Frame5MSLWorkflow query={chatQuery} onNavigate={() => goTo(6)} onWebinar={() => goTo(7)} onMedicalAffairs={(q) => goTo(2, q)} />
              ) : portalType === "patient" ? (
                <FramePatientPortal />
              ) : (
                <Frame8HCPChat onNavigate={() => goTo(6)} portalType={portalType} initialQuery={chatQuery} />
              )}
            </motion.div>
          )}
          {currentFrame === 6 && (
            <motion.div key="f6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              <Frame6PatientSignal onNavigate={() => goTo(7)} />
            </motion.div>
          )}
          {currentFrame === 7 && (
            <motion.div key="f7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              <Frame7Intelligence onRestart={() => goTo(1)} onNavigate={() => goTo(8)} />
            </motion.div>
          )}
          {currentFrame === 8 && (
            <motion.div key="f8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              <Frame8Analytics />
            </motion.div>
          )}
          {currentFrame === 9 && (
            <motion.div key="f9" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
              <Frame9Executive />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
