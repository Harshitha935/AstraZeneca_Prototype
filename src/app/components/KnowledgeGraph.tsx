import { motion } from "motion/react";

export interface KnowledgeNode {
  id: string;
  label: string;
  score: "positive" | "neutral" | "negative";
  pullUpstream?: boolean;
  x: number;
  y: number;
  activated?: boolean;
}

interface KnowledgeGraphProps {
  nodes: KnowledgeNode[];
  size?: "small" | "large";
  onNodeClick?: (node: KnowledgeNode) => void;
}

export function KnowledgeGraph({ nodes, size = "large", onNodeClick }: KnowledgeGraphProps) {
  const containerSize = size === "small" ? 300 : 400;
  const nodeRadius = size === "small" ? 32 : 40;

  const getScoreColor = (score: "positive" | "neutral" | "negative") => {
    switch (score) {
      case "positive":
        return "#10b981";
      case "neutral":
        return "#f59e0b";
      case "negative":
        return "#ef4444";
    }
  };

  return (
    <div className="relative" style={{ width: containerSize, height: containerSize }}>
      <svg width={containerSize} height={containerSize} className="absolute inset-0">
        {nodes.map((node, i) => {
          return nodes.slice(i + 1).map((targetNode) => (
            <line
              key={`${node.id}-${targetNode.id}`}
              x1={node.x}
              y1={node.y}
              x2={targetNode.x}
              y2={targetNode.y}
              stroke="#e5e7eb"
              strokeWidth="1"
              opacity="0.3"
            />
          ));
        })}
      </svg>

      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute cursor-pointer group"
          style={{
            left: node.x - nodeRadius,
            top: node.y - nodeRadius,
            width: nodeRadius * 2,
            height: nodeRadius * 2,
          }}
          whileHover={{ scale: 1.1 }}
          onClick={() => onNodeClick?.(node)}
        >
          <div className="relative w-full h-full">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "#ffffff",
                border: `3px solid ${getScoreColor(node.score)}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            />
            {node.activated && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `2px solid ${getScoreColor(node.score)}`,
                }}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center px-1">
              <span className="text-[9px] text-center leading-tight" style={{ color: "#374151" }}>
                {node.label}
              </span>
            </div>
            {node.pullUpstream && (
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#ef4444", color: "#ffffff" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 10V2M6 2L3 5M6 2L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-900 text-white px-2 py-1 rounded text-xs pointer-events-none">
            {node.score === "positive" ? "Contributing well" : node.score === "neutral" ? "Neutral impact" : "Needs attention"}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
