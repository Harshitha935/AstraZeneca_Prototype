import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { AlertCircle, FileText, Package, Mic, ArrowRight, Building, Check, Volume2 } from "lucide-react";

interface Frame2Props {
  initialQuery?: string;
  onNavigate: () => void;
}

type Category = "adverse" | "medical" | "quality" | null;
type UserType = "patient" | "hcp" | "caregiver" | "employee" | null;

interface RequiredInfo {
  id: string;
  label: string;
  completed: boolean;
}

const categories = [
  {
    id: "adverse" as Category,
    icon: AlertCircle,
    title: "Report an Adverse Event",
    description: "Adverse events are also effects and are unwanted or unexpected events or reactions to a medicine or device.",
  },
  {
    id: "medical" as Category,
    icon: FileText,
    title: "Request Medical Information",
    description: "Medical information enquiries or medical or scientific questions relating to our medicines and devices.",
  },
  {
    id: "quality" as Category,
    icon: Package,
    title: "Report a product quality issue",
    description: "Product quality complaints relate to a physical issue with a medicine or a device and/or its packaging.",
  },
];

const userTypes = [
  { id: "patient" as UserType, label: "Patient" },
  { id: "hcp" as UserType, label: "Health Care Professional / HCP Staff" },
  { id: "caregiver" as UserType, label: "Caregiver / Friend / Relative / Other" },
  { id: "employee" as UserType, label: "AstraZeneca Employee / Vendor" },
];

export function Frame2MedicalAffairsPortal({ initialQuery, onNavigate }: Frame2Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [typedInput, setTypedInput] = useState(initialQuery || "");
  const [isRobotVerified, setIsRobotVerified] = useState(false);

  // Check if initial query has device name
  useEffect(() => {
    if (initialQuery && initialQuery.length > 20) {
      updateRequiredInfo("question", true);
      // Check for medication/device names in the query
      if (initialQuery.toLowerCase().includes("tagrisso") ||
          initialQuery.toLowerCase().includes("drug") ||
          initialQuery.toLowerCase().includes("treatment") ||
          initialQuery.toLowerCase().includes("medication")) {
        updateRequiredInfo("device", true);
      }
    }
  }, [initialQuery]);

  const [requiredInfo, setRequiredInfo] = useState<RequiredInfo[]>([
    { id: "userType", label: "User identification", completed: false },
    { id: "question", label: "Medical question", completed: false },
    { id: "device", label: "Device/Medication name", completed: false },
  ]);

  useEffect(() => {
    if (selectedCategory && selectedUserType) {
      speakMessage("Thank you. Please speak your medical question when ready.");
    } else if (selectedCategory) {
      speakMessage("Great. Confirm your identity.");
    }
  }, [selectedCategory, selectedUserType]);

  const speakMessage = (message: string) => {
    setCurrentMessage(message);
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  const updateRequiredInfo = (id: string, completed: boolean) => {
    setRequiredInfo((prev) => prev.map((item) => (item.id === id ? { ...item, completed } : item)));
  };

  const handleUserTypeSelect = (type: UserType) => {
    setSelectedUserType(type);
    updateRequiredInfo("userType", true);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    speakMessage("Listening... Please tell me your medical question.");

    setTimeout(() => {
      setIsRecording(false);
      const transcribedText = "What is the current dosing evidence for Tagrisso in patients who've already progressed on a PD-1 inhibitor? Are there any real-world data studies beyond the Phase III trial population?";
      setVoiceInput(transcribedText);
      setTypedInput(transcribedText);
      updateRequiredInfo("question", true);

      // Check if device name is mentioned
      setTimeout(() => {
        updateRequiredInfo("device", true);
        speakMessage("Thank you. I've detected the medication name. Please verify you're not a robot to submit.");
      }, 1500);
    }, 3000);
  };

  const handleTypedInputChange = (value: string) => {
    setTypedInput(value);
    if (value.length > 20) {
      updateRequiredInfo("question", true);
      // Simple check for device/medication name
      if (value.toLowerCase().includes("tagrisso") || value.toLowerCase().includes("medication") || value.toLowerCase().includes("drug")) {
        updateRequiredInfo("device", true);
      }
    }
  };

  const handleSubmit = () => {
    onNavigate();
  };

  const allInfoCompleted = requiredInfo.every((item) => item.completed) && isRobotVerified;

  return (
    <div className="h-full bg-[#F5F5F7] flex items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        {/* Portal Header */}
        <motion.div className="bg-white rounded-t-2xl px-8 py-6 border-b border-gray-200" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#830051" }}>
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 style={{ color: "#1D2B4F" }}>Medical Affairs Portal</h2>
              <p className="text-sm text-gray-600 mt-0.5">Voice-assisted information collection</p>
            </div>
          </div>
        </motion.div>

        {/* Portal Content */}
        <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-3 gap-6 p-8">
            {/* Left Column - Voice Interface */}
            <div className="col-span-2 space-y-6">
              {/* Voice Message Display */}
              {currentMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-purple-50 border-2 border-[#830051] rounded-xl p-4 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#830051" }}>
                    <Volume2 className={`w-5 h-5 text-white ${isSpeaking ? "animate-pulse" : ""}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: "#1D2B4F" }}>
                      {currentMessage}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Category Selection */}
              {!selectedCategory && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <h3 className="mb-4" style={{ color: "#1D2B4F" }}>
                    What can we help you with?
                  </h3>

                  <div className="space-y-3">
                    {categories.map((category, idx) => {
                      const Icon = category.icon;
                      return (
                        <motion.button
                          key={category.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                          onClick={() => setSelectedCategory(category.id)}
                          className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-[#830051] bg-white transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-gray-600 group-hover:text-[#830051]" />
                            <div className="flex-1">
                              <div className="text-sm" style={{ color: "#1D2B4F" }}>
                                {category.title}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* User Type Selection */}
              {selectedCategory && !selectedUserType && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}>
                  <h3 className="mb-4" style={{ color: "#1D2B4F" }}>
                    I am a...
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    {userTypes.map((type, idx) => (
                      <motion.button
                        key={type.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleUserTypeSelect(type.id)}
                        className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#830051] bg-white transition-all text-left"
                      >
                        <span className="text-sm" style={{ color: "#1D2B4F" }}>
                          {type.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Voice/Text Input Interface */}
              {selectedCategory && selectedUserType && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 style={{ color: "#1D2B4F" }}>Your Medical Question</h3>
                    {initialQuery && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">From chat</span>
                    )}
                  </div>

                  {/* Voice Input */}
                  <div className="flex flex-col items-center justify-center py-6 mb-4">
                    <button
                      onClick={handleStartRecording}
                      disabled={isRecording}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                        isRecording ? "bg-red-500" : "bg-[#830051]"
                      } hover:scale-105 disabled:cursor-not-allowed`}
                    >
                      <Mic className="w-12 h-12 text-white" />
                      {isRecording && (
                        <motion.div
                          className="absolute inset-0 rounded-full border-4 border-red-500"
                          animate={{ scale: [1, 1.4], opacity: [0.8, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </button>

                    <motion.p
                      className="text-sm mt-4"
                      style={{ color: isRecording ? "#EF4444" : "#1D2B4F" }}
                      animate={{ opacity: isRecording ? [1, 0.5, 1] : 1 }}
                      transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
                    >
                      {isRecording ? "Listening..." : "Tap to speak"}
                    </motion.p>
                  </div>

                  {/* Text Input Alternative */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2 text-center">or type your question below:</div>
                    <textarea
                      value={typedInput}
                      onChange={(e) => handleTypedInputChange(e.target.value)}
                      placeholder="Enter your medical question here... Include the medication or device name."
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#830051] text-sm"
                    />
                  </div>

                  {/* Robot Verification */}
                  {requiredInfo.find(item => item.id === "device")?.completed && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4"
                    >
                      <div className="flex items-center justify-end">
                        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="robot-check"
                            checked={isRobotVerified}
                            onChange={(e) => setIsRobotVerified(e.target.checked)}
                            className="w-6 h-6 cursor-pointer"
                            style={{ accentColor: "#830051" }}
                          />
                          <label htmlFor="robot-check" className="text-sm text-gray-700 cursor-pointer select-none">
                            I'm not a robot
                          </label>
                          <div className="w-10 h-10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  {allInfoCompleted && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleSubmit}
                      className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
                      style={{ backgroundColor: "#830051" }}
                    >
                      Submit to Medical Affairs
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Right Column - Required Information Checklist */}
            <div className="col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 sticky top-0">
                <h4 className="mb-4 text-sm" style={{ color: "#1D2B4F" }}>
                  We'll need the following information from you:
                </h4>

                <div className="space-y-3">
                  {requiredInfo.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${item.completed ? "bg-green-50" : "bg-white"}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          item.completed ? "bg-green-500" : "bg-gray-200"
                        }`}
                      >
                        {item.completed ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs text-gray-500">{idx + 1}</span>
                        )}
                      </div>
                      <span className={`text-sm ${item.completed ? "text-green-900" : "text-gray-700"}`}>{item.label}</span>
                    </motion.div>
                  ))}
                </div>

                {allInfoCompleted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-green-900">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">All information collected</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
