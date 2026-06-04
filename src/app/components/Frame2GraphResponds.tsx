import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface Frame2Props {
  onNavigate: () => void;
}

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  active?: boolean;
  alert?: boolean;
  tooltip?: string;
}

const nodes: GraphNode[] = [
  { id: "1", label: "Scientific Evidence", x: 200, y: 80, active: true },
  { id: "2", label: "Treatment Guidelines", x: 340, y: 140, active: true },
  { id: "3", label: "Adverse Events", x: 360, y: 260 },
  { id: "4", label: "Unmet Clinical Need", x: 280, y: 340, alert: true, tooltip: "Repeated query type — pattern emerging" },
  { id: "5", label: "Real-World Evidence", x: 160, y: 380, active: true },
  { id: "6", label: "Product Information", x: 60, y: 320 },
  { id: "7", label: "Medical Affairs", x: 40, y: 200 },
  { id: "8", label: "Patient Outcomes", x: 100, y: 100 },
];

export function Frame2GraphResponds({ onNavigate }: Frame2Props) {
  const logEntries = [
    "Query type: off-label scientific information request",
    "Nodes activated: 3",
    "Unmet need signal: positive",
    "Routed to: Medical Affairs Oncology",
  ];

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex-1 grid grid-cols-2">
        {/* Left Panel - Chat Widget */}
        <div className="bg-[#F5F5F7] flex items-center justify-center p-8">
          <div className="w-80 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-4 py-3" style={{ backgroundColor: "#830051" }}>
              <span className="text-white text-sm">AZ Scientific Exchange</span>
            </div>
            <div className="p-4">
              <div className="bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-2.5">
                <p className="text-sm text-gray-800">What is the current dosing evidence for [treatment] in second-line NSCLC with co-mutations?</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Knowledge Graph */}
        <div className="bg-white flex flex-col items-center justify-center p-8">
          <motion.div
            className="relative"
            style={{ width: 420, height: 460 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Connections */}
            <svg width="420" height="460" className="absolute inset-0">
              {nodes.map((node, i) =>
                nodes.slice(i + 1).map((target) => (
                  <line key={`${node.id}-${target.id}`} x1={node.x} y1={node.y} x2={target.x} y2={target.y} stroke="#E8E8EA" strokeWidth="1.5" opacity="0.4" />
                ))
              )}
              {/* Route to Medical Affairs */}
              <motion.line
                x1={nodes[3].x}
                y1={nodes[3].y}
                x2={nodes[6].x}
                y2={nodes[6].y}
                stroke="#830051"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </svg>

            {/* Nodes */}
            {nodes.map((node, idx) => (
              <motion.div
                key={node.id}
                className="absolute"
                style={{
                  left: node.x - 40,
                  top: node.y - 40,
                  width: 80,
                  height: 80,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center relative ${node.active ? "ring-4" : node.alert ? "ring-4" : ""}`}
                  style={{
                    backgroundColor: node.active || node.alert ? (node.active ? "#830051" : "#F5A623") : "#E8E8EA",
                    ringColor: node.active ? "#830051" : node.alert ? "#F5A623" : "transparent",
                  }}
                >
                  <span className={`text-[10px] text-center leading-tight px-2 ${node.active || node.alert ? "text-white" : "text-gray-600"}`}>{node.label}</span>

                  {node.active && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: "3px solid #830051" }}
                      animate={{
                        scale: [1, 1.3],
                        opacity: [0.8, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                  )}

                  {node.alert && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: "3px solid #F5A623" }}
                      animate={{
                        scale: [1, 1.3],
                        opacity: [0.8, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                  )}
                </div>

                {node.tooltip && (
                  <motion.div
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded text-xs whitespace-nowrap"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                  >
                    {node.tooltip}
                  </motion.div>
                )}

                {node.id === "7" && (
                  <motion.div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap px-2 py-1 rounded"
                    style={{ backgroundColor: "#830051", color: "white" }}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    Flagged for MSL follow-up
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Terminal Log */}
          <motion.div className="w-full max-w-md bg-[#1D2B4F] rounded-lg p-4 mt-6 font-mono" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
            {logEntries.map((entry, idx) => (
              <motion.div key={idx} className="text-xs text-green-400 mb-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + idx * 0.2 }}>
                <span className="text-gray-500">{">"} </span>
                {entry}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Navigation Button */}
      <div className="border-t border-gray-200 p-6 flex items-center justify-between bg-[#F5F5F7]">
        <p className="text-sm max-w-2xl" style={{ color: "#1D2B4F" }}>
          The model doesn't store a visit. It encodes what the interaction means and where it should go.
        </p>
        <button onClick={onNavigate} className="px-6 py-3 rounded-lg text-white flex items-center gap-2" style={{ backgroundColor: "#830051" }}>
          See how this escalates
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
