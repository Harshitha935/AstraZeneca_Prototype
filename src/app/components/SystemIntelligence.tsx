import { KnowledgeGraph, KnowledgeNode } from "./KnowledgeGraph";
import { TrendingUp, TrendingDown, AlertTriangle, Activity, Users, MessageSquare, FileText } from "lucide-react";

const aggregateNodes: KnowledgeNode[] = [
  { id: "1", label: "Scientific Exchange", score: "positive", x: 200, y: 50, activated: true },
  { id: "2", label: "Product Information", score: "positive", x: 310, y: 120, activated: true },
  { id: "3", label: "Adverse Events", score: "negative", x: 340, y: 230, pullUpstream: true, activated: true },
  { id: "4", label: "Unmet Needs", score: "neutral", x: 280, y: 330 },
  { id: "5", label: "Treatment Guidelines", score: "positive", x: 160, y: 360, activated: true },
  { id: "6", label: "Real-World Evidence", score: "neutral", x: 60, y: 300 },
  { id: "7", label: "Patient Outcomes", score: "positive", x: 40, y: 190, activated: true },
  { id: "8", label: "Competitor Context", score: "neutral", x: 90, y: 90 },
];

interface DataSource {
  name: string;
  icon: React.ElementType;
  count: number;
  trend: "up" | "down" | "stable";
  color: string;
}

const dataSources: DataSource[] = [
  { name: "MSL Interactions", icon: Users, count: 247, trend: "up", color: "#6B0F3A" },
  { name: "Portal Queries", icon: MessageSquare, count: 1834, trend: "up", color: "#8B2A54" },
  { name: "MA Consultations", icon: FileText, count: 89, trend: "stable", color: "#4A0A27" },
  { name: "Patient Signals", icon: Activity, count: 156, trend: "down", color: "#ef4444" },
];

interface NodeMetric {
  node: string;
  volume: number;
  trend: "up" | "down";
  dependencyStrength: number;
  resolutionRate?: number;
}

const nodeMetrics: NodeMetric[] = [
  { node: "Scientific Exchange", volume: 1247, trend: "up", dependencyStrength: 92 },
  { node: "Product Information", volume: 892, trend: "up", dependencyStrength: 88 },
  { node: "Adverse Events", volume: 234, trend: "up", dependencyStrength: 67, resolutionRate: 42 },
  { node: "Treatment Guidelines", volume: 567, trend: "up", dependencyStrength: 85 },
  { node: "Patient Outcomes", volume: 445, trend: "up", dependencyStrength: 79 },
];

const emergingKPI = {
  title: "Time-to-MSL-response on safety queries",
  status: "Relationship stabilising over 6 weeks",
  currentValue: "4.2 hours",
  targetValue: "< 6 hours",
  confidence: 87,
};

export function SystemIntelligence() {
  return (
    <div className="h-screen bg-white overflow-y-auto">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">System Intelligence Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Aggregate knowledge graph across all engagement surfaces</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Last Updated</div>
              <div className="text-gray-900">2 minutes ago</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Knowledge Graph */}
          <div className="col-span-7">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-gray-900 mb-6">Aggregate Knowledge Graph</h2>

              <div className="flex justify-center mb-6">
                <KnowledgeGraph nodes={aggregateNodes} size="large" />
              </div>

              <div className="space-y-3">
                {nodeMetrics.map((metric) => (
                  <div key={metric.node} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          metric.resolutionRate && metric.resolutionRate < 50 ? "bg-red-500" : metric.dependencyStrength > 85 ? "bg-green-500" : "bg-amber-500"
                        }`}
                      />
                      <div>
                        <div className="text-sm text-gray-900">{metric.node}</div>
                        {metric.resolutionRate !== undefined && (
                          <div className="text-xs text-red-600 mt-0.5">
                            <AlertTriangle className="w-3 h-3 inline mr-1" />
                            {metric.resolutionRate}% resolution rate
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-900">{metric.volume.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">interactions</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {metric.trend === "up" ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                      </div>
                      <div className="w-20">
                        <div className="text-xs text-gray-500 mb-1">Dependency</div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--az-mulberry)]" style={{ width: `${metric.dependencyStrength}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Metrics & Insights */}
          <div className="col-span-5 space-y-6">
            {/* Data Sources */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-gray-900 mb-4">Cross-Surface Data</h3>
              <div className="space-y-3">
                {dataSources.map((source) => {
                  const Icon = source.icon;
                  return (
                    <div key={source.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${source.color}15` }}>
                          <Icon className="w-5 h-5" style={{ color: source.color }} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-900">{source.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Last 7 days</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-gray-900">{source.count}</div>
                        {source.trend === "up" && <TrendingUp className="w-4 h-4 text-green-600" />}
                        {source.trend === "down" && <TrendingDown className="w-4 h-4 text-red-600" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Critical Alert */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-900 mb-2">Critical Node Alert</h3>
                  <div className="text-sm text-red-800 mb-3">
                    <strong>Adverse Events</strong>: High volume, low resolution rate — 3 upstream dependencies affected
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">Treatment Guidelines</span>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">Patient Outcomes</span>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">Scientific Exchange</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emerging KPI */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-gray-900">Emerging KPI Candidate</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-900 mb-1">{emergingKPI.title}</div>
                  <div className="text-xs text-gray-500">{emergingKPI.status}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Current</div>
                    <div className="text-lg text-gray-900">{emergingKPI.currentValue}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Target</div>
                    <div className="text-lg" style={{ color: "var(--az-mulberry)" }}>
                      {emergingKPI.targetValue}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Confidence Score</span>
                    <span>{emergingKPI.confidence}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${emergingKPI.confidence}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
