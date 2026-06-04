import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Check, AlertCircle, Info, Package } from "lucide-react";

type ConsultationStep = "voice" | "review";
type Category = "adverse-event" | "information" | "quality";

const categories = [
  { id: "adverse-event" as Category, label: "Report Adverse Event", icon: AlertCircle },
  { id: "information" as Category, label: "Request Information", icon: Info },
  { id: "quality" as Category, label: "Product Quality", icon: Package },
];

export function MAConsultation() {
  const [step, setStep] = useState<ConsultationStep>("voice");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [transcribedText, setTranscribedText] = useState("");

  const handleStartRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setTranscribedText(
        "Patient presented with grade 2 fatigue and mild nausea approximately 5 days after initiating treatment. Symptoms are manageable with supportive care. Patient continues on therapy. No dose modifications required at this time."
      );
      setSelectedCategory("adverse-event");
      setStep("review");
    }, 3000);
  };

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-lg w-full">
        <AnimatePresence mode="wait">
          {step === "voice" ? (
            <motion.div key="voice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-2xl shadow-xl p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-gray-900 mb-2">Medical Affairs Consultation</h2>
                <p className="text-sm text-gray-600">Speak your consultation or query</p>
              </div>

              {/* Category Chips */}
              <div className="flex gap-2 mb-8 justify-center flex-wrap">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${
                        selectedCategory === cat.id ? "text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      style={selectedCategory === cat.id ? { backgroundColor: "var(--az-mulberry)" } : {}}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Voice Input */}
              <div className="flex flex-col items-center">
                <motion.button
                  onClick={handleStartRecording}
                  disabled={isRecording}
                  className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg relative"
                  style={{ backgroundColor: isRecording ? "#ef4444" : "var(--az-mulberry)" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mic className="w-12 h-12 text-white" />

                  {isRecording && (
                    <motion.div className="absolute inset-0 rounded-full border-4" style={{ borderColor: "#ef4444" }} initial={{ scale: 1, opacity: 1 }} animate={{ scale: 1.4, opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity }} />
                  )}
                </motion.button>

                <motion.p className="mt-6 text-sm text-gray-600" animate={{ opacity: isRecording ? [1, 0.5, 1] : 1 }} transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}>
                  {isRecording ? "Listening..." : "Tap to start recording"}
                </motion.p>

                {/* Waveform Animation */}
                {isRecording && (
                  <div className="flex gap-1 mt-6">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-[var(--az-mulberry)] rounded-full"
                        initial={{ height: 8 }}
                        animate={{
                          height: [8, 24, 8],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-900">
                  <Info className="w-4 h-4 inline mr-2" />
                  Your consultation will be securely recorded and routed to the appropriate Medical Affairs team
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white rounded-2xl shadow-xl p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-gray-900 mb-2">Review Your Consultation</h2>
                <p className="text-sm text-gray-600">Edit details before submitting</p>
              </div>

              {/* Category Badge */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Category</label>
                <div className="flex gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all border ${
                          selectedCategory === cat.id ? "border-[var(--az-mulberry)] text-white" : "border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                        style={selectedCategory === cat.id ? { backgroundColor: "var(--az-mulberry)" } : { backgroundColor: "#ffffff" }}
                      >
                        <Icon className="w-4 h-4" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Transcribed Text */}
              <div className="mb-4">
                <label className="text-sm text-gray-600 mb-2 block">Consultation Details</label>
                <textarea value={transcribedText} onChange={(e) => setTranscribedText(e.target.value)} rows={6} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--az-mulberry)] text-sm bg-white resize-none" />
              </div>

              {/* Routing Info */}
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-sm text-gray-600 mb-2">Routed To:</div>
                <div className="text-gray-900">Medical Affairs — Oncology Team</div>
                <div className="text-xs text-gray-500 mt-2">Expected response within 24 hours</div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={() => setStep("voice")} className="flex-1 px-6 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                  Re-record
                </button>
                <button className="flex-1 px-6 py-3 rounded-lg text-white" style={{ backgroundColor: "var(--az-mulberry)" }}>
                  Submit Consultation
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">All consultations are encrypted and GDPR compliant</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
