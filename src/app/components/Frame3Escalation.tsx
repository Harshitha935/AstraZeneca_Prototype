import { useState } from "react";
import { motion } from "motion/react";
import { Mic, AlertCircle, Info, Package } from "lucide-react";

interface Frame3Props {
  onNavigate: () => void;
}

type Category = "adverse" | "scientific" | "quality";

const categories = [
  { id: "adverse" as Category, label: "Report Adverse Event", icon: AlertCircle },
  { id: "scientific" as Category, label: "Request Scientific Information", icon: Info },
  { id: "quality" as Category, label: "Product Quality", icon: Package },
];

export function Frame3Escalation({ onNavigate }: Frame3Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("scientific");
  const [isRecording] = useState(true);

  const transcribedText = "Can you provide more detail on the dosing protocols for patients with renal impairment? I have a case where standard guidelines may not apply due to co-morbidities.";

  return (
    <div className="h-full bg-[#F5F5F7] flex flex-col items-center justify-center p-8">
      {/* Phone Mockup */}
      <div className="relative">
        <div className="w-96 bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-gray-800" style={{ height: "740px" }}>
          {/* Status Bar */}
          <div className="bg-white px-8 pt-3 pb-2 flex items-center justify-between">
            <span className="text-xs">9:41</span>
            <div className="flex gap-1">
              <div className="w-4 h-3 border border-gray-400 rounded-sm"></div>
              <div className="w-4 h-3 border border-gray-400 rounded-sm"></div>
              <div className="w-4 h-3 border border-gray-400 rounded-sm"></div>
            </div>
          </div>

          {/* App Content */}
          <div className="bg-white h-full flex flex-col">
            {/* Header */}
            <div className="px-6 py-4" style={{ backgroundColor: "#830051" }}>
              <h3 className="text-white text-lg">Talk to Medical Affairs</h3>
              <p className="text-white/80 text-sm mt-1">Voice consultation</p>
            </div>

            {/* Category Chips */}
            <div className="px-6 py-4 space-y-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedCategory === cat.id ? "text-white" : "bg-gray-100 text-gray-700"}`}
                    style={selectedCategory === cat.id ? { backgroundColor: "#830051" } : {}}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Voice Recording Interface */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              {/* Waveform */}
              <motion.div className="flex items-center gap-1 mb-6">
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 rounded-full"
                    style={{ backgroundColor: "#830051" }}
                    animate={{
                      height: [12, 32, 12],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.08,
                    }}
                  />
                ))}
              </motion.div>

              {/* Mic Button */}
              <div className="relative mb-6">
                <motion.div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#830051" }}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <Mic className="w-10 h-10 text-white" />
                </motion.div>

                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: "3px solid #830051" }}
                  animate={{
                    scale: [1, 1.6],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />
              </div>

              <motion.p
                className="text-sm mb-6"
                style={{ color: "#830051" }}
                animate={{
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                Listening...
              </motion.p>

              {/* Transcribed Text */}
              <motion.div className="w-full bg-gray-50 rounded-xl p-4 mb-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ delay: 0.5 }}>
                <div className="text-xs text-gray-500 mb-2">Auto-transcribed:</div>
                <p className="text-sm text-gray-800 leading-relaxed">{transcribedText}</p>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                onClick={onNavigate}
                className="w-full py-4 rounded-xl text-white"
                style={{ backgroundColor: "#830051" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit to Medical Affairs — Oncology Team
              </motion.button>

              {/* Note */}
              <motion.p className="text-xs text-gray-500 text-center mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                Routed to the same knowledge graph. The channel changed. The signal didn't.
              </motion.p>
            </div>
          </div>
        </div>

        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl"></div>
      </div>

      {/* Caption */}
      <motion.div className="mt-8 max-w-2xl text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
        <p className="text-sm" style={{ color: "#1D2B4F" }}>
          Compliance-safe. Voice-to-structured-submission. No form. No friction. No lost signal.
        </p>
      </motion.div>
    </div>
  );
}
