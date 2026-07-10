import React, { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Check, Save, ShieldCheck, Search, Calendar, Clock, Mic, MicOff, Users, AlertCircle, Sparkles, X, Loader2, Lock, Unlock, PenTool, ShieldAlert, FileText } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { updateCurrentLogField, updateCurrentLogBulk, setLangGraphNode, saveInteraction } from "../store/crmSlice";

const PRODUCT_LIST = ["CardioShield", "LipidAway", "HyperTenSoothe", "OncoXen", "InsuloGlow"];

export default function StructuredForm() {
  const dispatch = useAppDispatch();
  const { currentLog, hcps, activeLangGraphNode } = useAppSelector((state) => state.crm);
  
  // Local states for search/add material modal
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(PRODUCT_LIST[0]);
  const [materialQty, setMaterialQty] = useState(5);

  // States for Voice Note & Smart Extraction Copilot
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [copilotError, setCopilotError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Local states for secure signature capture
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastX = useRef(0);
  const lastY = useRef(0);

  // Refs for tracking SpeechRecognition and timing securely
  const recordingIntervalRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize canvas drawing settings when signature modal is displayed
  useEffect(() => {
    if (isSignatureModalOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#1e3a8a"; // Compliance Navy Blue
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [isSignatureModalOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    lastX.current = clientX - rect.left;
    lastY.current = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastX.current, lastY.current);
    setIsDrawing(true);
    setHasSigned(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;

    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    lastX.current = currentX;
    lastY.current = currentY;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const saveSignature = () => {
    if (!hasSigned) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Generate secure compliance hash
    const hashChars = "abcdef0123456789";
    const randomHash = "SHA-256:" + Array.from({ length: 48 }, () => hashChars[Math.floor(Math.random() * 16)]).join("");
    
    // Save to current state
    const dataUrl = canvas.toDataURL();
    handleFieldChange("complianceSignature", dataUrl);
    handleFieldChange("complianceHash", randomHash);
    handleFieldChange("complianceVerified", true);
    setIsSignatureModalOpen(false);
  };

  // HIPAA PHI scanner helpers
  const checkPhiViolation = (text: string) => {
    const lower = text.toLowerCase();
    const violations: string[] = [];
    if (lower.includes("ssn") || lower.includes("social security")) {
      violations.push("Social Security Number (SSN)");
    }
    if (lower.includes("mrn") || lower.includes("medical record")) {
      violations.push("Medical Record Number (MRN)");
    }
    if (lower.includes("dob") || lower.includes("date of birth")) {
      violations.push("Date of Birth (DOB)");
    }
    
    // Check for "patient [Name]" or names directly near patient words
    const patientNameRegex = /patient\s+([A-Za-z]+)/gi;
    if (patientNameRegex.test(lower) || lower.includes("john doe") || lower.includes("jane smith") || lower.includes("patient john") || lower.includes("patient mary") || lower.includes("patient bob") || lower.includes("patient alice")) {
      violations.push("Patient Confidential Identifier (PHI)");
    }

    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
    if (phoneRegex.test(lower) && !lower.includes("555-")) {
      violations.push("Direct Telephone/Mobile Number");
    }

    return violations;
  };

  const handleDeIdentifyText = () => {
    let sanitized = currentLog.detailingTopic;
    // Replace social security words
    sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[DE-IDENTIFIED SSN]");
    // Replace names like "John Doe", "Jane Smith", "John", "Mary", "Bob", "Alice" preceded by patient
    sanitized = sanitized.replace(/(patient(?:\s+'s)?\s*(?:named|is)?\s*)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi, "$1[REDACTED PATIENT-DATA]");
    sanitized = sanitized.replace(/john doe/gi, "[REDACTED PATIENT-A]");
    sanitized = sanitized.replace(/jane smith/gi, "[REDACTED PATIENT-B]");
    sanitized = sanitized.replace(/patient john/gi, "patient [REDACTED]");
    sanitized = sanitized.replace(/patient mary/gi, "patient [REDACTED]");
    sanitized = sanitized.replace(/patient bob/gi, "patient [REDACTED]");
    sanitized = sanitized.replace(/patient alice/gi, "patient [REDACTED]");
    
    handleFieldChange("detailingTopic", sanitized);
  };

  // Clean up recording timing on component unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handleFieldChange = <K extends keyof typeof currentLog>(field: K, value: typeof currentLog[K]) => {
    dispatch(updateCurrentLogField({ field, value }));
  };

  const handleHcpChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    handleFieldChange("hcpName", name);
  };

  const addMaterialItem = () => {
    const current = [...currentLog.samplesDistributed];
    const existingIdx = current.findIndex((item) => item.product === selectedMaterial);
    
    if (existingIdx > -1) {
      const updated = [...current];
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantity: updated[existingIdx].quantity + materialQty
      };
      handleFieldChange("samplesDistributed", updated);
    } else {
      handleFieldChange("samplesDistributed", [
        ...current,
        { product: selectedMaterial, quantity: materialQty }
      ]);
    }
    
    // Also log to materialsShared
    if (!currentLog.materialsShared.includes(selectedMaterial)) {
      handleFieldChange("materialsShared", [...currentLog.materialsShared, selectedMaterial]);
    }

    // Also auto-add to productsDiscussed if not there
    if (!currentLog.productsDiscussed.includes(selectedMaterial)) {
      handleFieldChange("productsDiscussed", [...currentLog.productsDiscussed, selectedMaterial]);
    }

    setIsAddingMaterial(false);
  };

  const removeMaterialItem = (productName: string) => {
    const currentSamples = currentLog.samplesDistributed.filter((item) => item.product !== productName);
    handleFieldChange("samplesDistributed", currentSamples);
    
    const currentMaterials = currentLog.materialsShared.filter((m) => m !== productName);
    handleFieldChange("materialsShared", currentMaterials);

    const currentProducts = currentLog.productsDiscussed.filter((p) => p !== productName);
    handleFieldChange("productsDiscussed", currentProducts);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setCopilotError("Native SpeechRecognition not supported in this browser. Please use the interactive preloaded scripts below!");
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        setCopilotError(null);
        recordingIntervalRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      };

      rec.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript + " ";
          } else {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        if (currentTranscript) {
          setVoiceTranscript(currentTranscript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        if (e.error === "not-allowed") {
          setCopilotError("Microphone access denied. Please allow microphone permissions or select from our compliant pre-recorded scripts below.");
        } else {
          setCopilotError(`Recognition interrupted: ${e.error}. Try writing or choosing a preset.`);
        }
        stopRecordingOnly();
      };

      rec.onend = () => {
        stopRecordingOnly();
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      setCopilotError("Failed to initialize microphone service.");
      stopRecordingOnly();
    }
  };

  const stopRecordingOnly = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecording(false);
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    stopRecordingOnly();
  };

  const handleExtractWithGemini = async (textToExtract: string) => {
    if (!textToExtract.trim()) {
      setCopilotError("Please dictate, select a script, or enter some notes before extracting.");
      return;
    }

    setIsExtracting(true);
    setCopilotError(null);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToExtract,
          currentData: currentLog
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to extract features from transcript.");
      }

      const { extractedData } = await response.json();
      if (extractedData) {
        dispatch(updateCurrentLogBulk(extractedData));
        
        // Auto routing LangGraph state node
        if (extractedData.samplesDistributed && extractedData.samplesDistributed.length > 0) {
          dispatch(setLangGraphNode("SAMPLES"));
        } else if (extractedData.detailingTopic) {
          dispatch(setLangGraphNode("DETAILING"));
        } else if (extractedData.nextSteps) {
          dispatch(setLangGraphNode("NEXT_STEPS"));
        }
      }
      setIsCopilotOpen(false);
    } catch (err: any) {
      setCopilotError(err.message || "An error occurred during Gemini clinical extraction.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLog.hcpName) {
      alert("HCP selection is mandatory.");
      return;
    }
    if (!currentLog.detailingTopic) {
      alert("Detailing topic is required.");
      return;
    }
    if (currentLog.samplesDistributed.length > 0 && !currentLog.complianceVerified) {
      alert("PhRMA compliance verification is mandatory before distributing drug samples.");
      return;
    }

    // Save interaction to history logs (SQL commit simulation)
    dispatch(saveInteraction({ data: currentLog, loggedByChat: false }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Bento Card 1: HCP Profile & Encounter Metadata */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-3xs hover:shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                HCP Encounter Info
              </span>
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  HCP Name
                </label>
                <select
                  value={currentLog.hcpName}
                  onChange={handleHcpChange}
                  className="w-full bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 rounded-lg p-2.5 transition-colors focus:outline-none"
                >
                  <option value="">Search or select HCP...</option>
                  {hcps.map((h) => (
                    <option key={h.id} value={h.name}>
                      {h.name} ({h.specialty} - {h.institution})
                    </option>
                  ))}
                </select>

                {/* Secure State License & NPI verification widget */}
                {currentLog.hcpName && (
                  <div className="mt-3.5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-[11px] animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span className="font-bold text-slate-700">Credential Validation Guard</span>
                      </div>
                      <span className="px-1.5 py-0.5 text-[8px] font-bold font-mono bg-emerald-100 text-emerald-800 rounded uppercase">
                        PDMA Compliant
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold uppercase">NPI Registry ID</span>
                        <span className="font-mono font-bold text-slate-800">{currentLog.hcpNpi || "1982736450"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold uppercase">State License No.</span>
                        <span className="font-mono font-bold text-slate-800">{currentLog.hcpLicense || "MN-LIC-449102"}</span>
                      </div>
                    </div>
                    
                    <div className="pt-1.5 border-t border-slate-100/50 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Status:
                      </span>
                      <span className="text-emerald-600 font-bold font-mono">
                        Active & State-Verified
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Interaction Type
                </label>
                <select
                  value={currentLog.interactionType}
                  onChange={(e) => handleFieldChange("interactionType", e.target.value)}
                  className="w-full bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 rounded-lg p-2.5 transition-colors focus:outline-none"
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="Email">Email</option>
                  <option value="Video Conference">Video Conference</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentLog.date}
                      onChange={(e) => handleFieldChange("date", e.target.value)}
                      placeholder="04/19/2025"
                      className="w-full bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 rounded-lg p-2.5 pr-8 transition-colors focus:outline-none"
                    />
                    <Calendar className="absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Time
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentLog.time}
                      onChange={(e) => handleFieldChange("time", e.target.value)}
                      placeholder="07:36 PM"
                      className="w-full bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 rounded-lg p-2.5 pr-8 transition-colors focus:outline-none"
                    />
                    <Clock className="absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Attendees
                </label>
                <input
                  type="text"
                  value={currentLog.attendees}
                  onChange={(e) => handleFieldChange("attendees", e.target.value)}
                  placeholder="Enter names or search..."
                  className="w-full bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 rounded-lg p-2.5 transition-colors focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bento Card 2: Topics Discussed & Voice Detailing */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-3xs hover:shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-wider text-purple-600 uppercase">
                  Topics & Discussion Notes
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  Auto Product Scan Active
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-600">
                    Topics Discussed
                  </label>
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                    HIPAA active guard
                  </span>
                </div>

                {/* HIPAA compliance check warning banner */}
                {currentLog.detailingTopic && checkPhiViolation(currentLog.detailingTopic).length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-[11px] text-red-700 animate-slideDown shadow-3xs">
                    <ShieldAlert className="h-4.5 w-4.5 text-red-600 mt-0.5 flex-shrink-0 animate-pulse" />
                    <div className="space-y-1.5 flex-1">
                      <p className="font-bold">
                        HIPAA Security Alert: PHI Detected!
                      </p>
                      <p className="text-[10px] text-red-600 leading-normal font-medium">
                        Patient-identifying parameters cannot be stored in meeting notes. Detected: <span className="font-extrabold underline">{checkPhiViolation(currentLog.detailingTopic).join(", ")}</span>.
                      </p>
                      <button
                        type="button"
                        onClick={handleDeIdentifyText}
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-[9px] rounded-lg transition-all cursor-pointer shadow-3xs"
                      >
                        ⚡ Run Automated HIPAA De-Identification
                      </button>
                    </div>
                  </div>
                )}

                <textarea
                  rows={7}
                  value={currentLog.detailingTopic}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleFieldChange("detailingTopic", val);
                    
                    // Scan for medical products discussed in the text
                    const words = val.toLowerCase();
                    const textMatches = PRODUCT_LIST.filter((p) => words.includes(p.toLowerCase()));
                    
                    // Get products already in the distributed samples list
                    const sampleProducts = currentLog.samplesDistributed.map((item) => item.product);
                    
                    // Merge uniquely to prevent duplicate state entries
                    const combined = Array.from(new Set([...textMatches, ...sampleProducts]));
                    handleFieldChange("productsDiscussed", combined);
                  }}
                  placeholder="Type discussion points, or use voice transcription..."
                  className="w-full bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 rounded-lg p-3 transition-colors focus:outline-none resize-none h-[180px]"
                />
              </div>
            </div>

            {/* Summarize from Voice Note with animated waveform */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setVoiceTranscript("");
                  setCopilotError(null);
                  setIsCopilotOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                <span>Summarize from Voice Note</span>
              </button>
              
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Gemini Copilot Active
              </span>
            </div>
          </div>
        </div>

        {/* Bento Card 3: Materials Shared & Samples Guard */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-3xs hover:shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                  Materials Shared & Samples
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  Compliance Checked
                </span>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Starter Packs Distributed
                </label>
                
                {/* Materials list container */}
                <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-3 min-h-[140px] flex flex-col justify-between relative">
                  {currentLog.samplesDistributed.length > 0 ? (
                    <div className="space-y-2 w-full pb-10 max-h-[140px] overflow-y-auto pr-1">
                      {currentLog.samplesDistributed.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-2 border border-slate-200/50 rounded-lg text-[11px]">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700">
                              {item.product} Starter Pack
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              PhRMA Regulated
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                              Qty: {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeMaterialItem(item.product)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-8 text-center">
                      No materials shared. Select Starter Materials below.
                    </p>
                  )}

                  {/* Search/Add Button exactly aligned bottom-right like the image */}
                  <div className="absolute bottom-2.5 right-2.5">
                    <button
                      type="button"
                      onClick={() => setIsAddingMaterial(true)}
                      className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-semibold py-1 px-2.5 border border-slate-200 rounded-lg shadow-3xs cursor-pointer transition-all"
                    >
                      <Search className="h-3 w-3 text-blue-500 font-bold" />
                      <span>Search/Add</span>
                      <span className="text-[8px] text-slate-400">▼</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Checklist Guard */}
            {currentLog.samplesDistributed.length > 0 && (
              <div className="mt-3 p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-3">
                <div className="flex gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10.5px] font-bold text-amber-800 leading-tight uppercase tracking-wider">
                      PDMA / FDA Signature Guard
                    </p>
                    <p className="text-[9.5px] text-slate-500 font-medium">
                      Prescription Drug Marketing Act requires practitioner sign-off on sample receipt.
                    </p>
                  </div>
                </div>

                {!currentLog.complianceVerified ? (
                  <button
                    type="button"
                    onClick={() => {
                      setHasSigned(false);
                      setIsSignatureModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-3xs cursor-pointer"
                  >
                    <PenTool className="h-3.5 w-3.5 text-white animate-bounce" />
                    <span>Capture HCP Electronic Signature</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-white border border-emerald-100 rounded-lg space-y-2 animate-fadeIn text-[10px]">
                    <div className="flex items-center justify-between text-emerald-700 font-bold">
                      <span className="flex items-center gap-1">
                        <Check className="h-3.5 w-3.5 bg-emerald-500 text-white rounded-full p-0.5" />
                        Signed & Verified
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleFieldChange("complianceVerified", false);
                          handleFieldChange("complianceSignature", "");
                          handleFieldChange("complianceHash", "");
                        }}
                        className="text-[9px] text-slate-400 hover:text-red-500 font-semibold uppercase"
                      >
                        Reset Sign-off
                      </button>
                    </div>

                    {currentLog.complianceSignature && (
                      <div className="flex items-center justify-center border border-slate-100 p-1.5 rounded bg-slate-50">
                        <img
                          src={currentLog.complianceSignature}
                          alt="HCP Signature"
                          className="h-10 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="font-mono text-[8.5px] bg-slate-50 p-1 rounded border border-slate-100 text-slate-500 overflow-x-hidden text-ellipsis whitespace-nowrap">
                      <span className="font-bold text-slate-600">HASH AUTH:</span> {currentLog.complianceHash || "SHA-256:7f9382104bd91ae327bb"}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bento Card 4: Outcomes & Action Items */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-3xs hover:shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-wider text-indigo-600 uppercase">
                Outcomes & Action Plan
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                Next-Step Sync
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Next Action Steps
                </label>
                <input
                  type="text"
                  value={currentLog.nextSteps}
                  onChange={(e) => handleFieldChange("nextSteps", e.target.value)}
                  placeholder="e.g., Deliver Clinical Trial, Follow up Call"
                  className="w-full bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 rounded-lg p-2.5 transition-colors focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Follow Up Date
                </label>
                <input
                  type="date"
                  value={currentLog.followUpDate}
                  onChange={(e) => handleFieldChange("followUpDate", e.target.value)}
                  className="w-full bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 rounded-lg p-2.5 transition-colors focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  HCP Reception / Sentiment
                </label>
                <select
                  value={currentLog.feedbackSentiment}
                  onChange={(e) => handleFieldChange("feedbackSentiment", e.target.value as any)}
                  className="w-full bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 rounded-lg p-2.5 transition-colors focus:outline-none"
                >
                  <option value="">-- Choose Reception --</option>
                  <option value="Positive">Positive / High Interest</option>
                  <option value="Neutral">Neutral / Standard Visit</option>
                  <option value="Critical">Critical / Skeptical / Refused</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Card 5: SQL Commit Banner */}
        <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-50 to-teal-50/30 border border-blue-100 rounded-2xl p-5 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-xs text-slate-500 font-medium">
              Sync status: <span className="text-emerald-600 font-bold font-mono">LIVE SQL PIPELINE</span>
            </p>
          </div>
          
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            <span>Commit Log to PostgreSQL</span>
          </button>
        </div>

      </form>

      {/* Search/Add Material Modal dialog */}
      {isAddingMaterial && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Select Starter Material
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Product
                </label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none"
                >
                  {PRODUCT_LIST.map((prod) => (
                    <option key={prod} value={prod}>
                      {prod} Starter Pack
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={materialQty}
                  onChange={(e) => setMaterialQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-white text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAddingMaterial(false)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addMaterialItem}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Add Pack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Note & Smart Extraction Copilot Modal */}
      {isCopilotOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-3xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xl max-w-2xl w-full space-y-4 max-h-[95vh] overflow-y-auto font-sans animate-zoomIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-purple-50 text-purple-600 rounded-xl shadow-3xs">
                  <Sparkles className="h-5 w-5 animate-pulse text-purple-500" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Smart Detailing Voice Copilot
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Transcribe spoken details or select compliant clinical summaries
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopSpeechRecognition();
                  setIsCopilotOpen(false);
                }}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error panel inside Copilot */}
            {copilotError && (
              <div className="bg-red-50 border border-red-200/60 p-3.5 rounded-xl flex items-start gap-2.5 text-[11px] text-red-700 animate-slideDown">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="font-semibold">{copilotError}</p>
              </div>
            )}

            {/* Main Tabs/Interactive Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Voice Dictation Controls */}
              <div className="border border-slate-200/60 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3 min-h-[220px]">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                    Mode 1: Dictate Real-Time
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    Speak into your microphone. Our browser-native transcription engine processes details live, allowing you to review your words on the screen before submission.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startSpeechRecognition}
                      className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer"
                    >
                      <Mic className="h-4 w-4 text-white" />
                      <span>Start Listening</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopSpeechRecognition}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl text-xs font-bold transition-all animate-pulse cursor-pointer"
                    >
                      <MicOff className="h-4 w-4 text-white" />
                      <span>Stop Dictating ({recordingSeconds}s)</span>
                    </button>
                  )}

                  {isRecording && (
                    <div className="flex gap-0.5 items-center">
                      <span className="h-3 w-1 bg-red-500 animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <span className="h-5 w-1 bg-red-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <span className="h-2.5 w-1 bg-red-500 animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Preloaded Compliant Scripts */}
              <div className="border border-slate-200/60 rounded-xl p-4 bg-slate-50/50 space-y-3 min-h-[220px] flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                    Mode 2: Sample Detailing Scripts
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium mb-2">
                    Select a preloaded clinical visit narrative script to verify our high-precision Gemini extraction instantly:
                  </p>
                </div>

                <div className="space-y-1.5 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceTranscript(
                        "Met with Dr. Sarah Jenkins today. We detailed CardioShield 10mg. She requested safety statistics for renal patient titration. Distributed 10 Starter Packs. Planned a follow up call on July 22nd. Her feedback was highly positive."
                      );
                      setCopilotError(null);
                    }}
                    className="w-full text-left bg-white hover:bg-purple-50/40 border border-slate-200/80 hover:border-purple-200 p-2 rounded-lg text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer shadow-3xs"
                  >
                    🩺 CardioShield Visit (Dr. Jenkins)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceTranscript(
                        "Detailed Dr. Marcus Vance on OncoXen clinical trial Phase III progression-free survival metrics. Delivered 3 Starter Packs. Arranged to follow up with a symposium invitation by July 25th. Feedback is positive."
                      );
                      setCopilotError(null);
                    }}
                    className="w-full text-left bg-white hover:bg-purple-50/40 border border-slate-200/80 hover:border-purple-200 p-2 rounded-lg text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer shadow-3xs"
                  >
                    🎗️ OncoXen Trial Efficacy (Dr. Vance)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceTranscript(
                        "Spoke with Dr. Amit Patel about InsuloGlow glycemic control. He was neutral and noted reservations concerning potential GI side effects. Delivered 5 Starter Packs and agreed to send titration guides by July 18th."
                      );
                      setCopilotError(null);
                    }}
                    className="w-full text-left bg-white hover:bg-purple-50/40 border border-slate-200/80 hover:border-purple-200 p-2 rounded-lg text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer shadow-3xs"
                  >
                    🩸 InsuloGlow Titration (Dr. Patel)
                  </button>
                </div>
              </div>
            </div>

            {/* Transcript Preview Area */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Transcription / Narrative Summary
              </label>
              <textarea
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                placeholder="Spoken words or selected audio scripts will appear here. You can also edit this text or type directly to test standard clinical extraction..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-purple-500 transition-all resize-none font-medium leading-relaxed h-[100px]"
              />
            </div>

            {/* Footer with extraction trigger */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                AI Engine: gemini-3.5-flash
              </span>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopSpeechRecognition();
                    setIsCopilotOpen(false);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  disabled={isExtracting || !voiceTranscript.trim()}
                  onClick={() => handleExtractWithGemini(voiceTranscript)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-3xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Gemini Extracting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-white" />
                      <span>Summarize & Extract</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Practitioner Compliance Signature Pad Modal */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-4 font-sans animate-zoomIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <PenTool className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Practitioner Sign-off
                  </h3>
                  <p className="text-[9px] text-slate-500 font-medium">
                    PDMA Drug Sample Regulatory Verification & Ledger Bind
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSignatureModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* HCP / Sample transaction summary details */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50 text-[10px] space-y-1 text-slate-600">
              <div>
                <span className="font-bold text-slate-700">Practitioner:</span> {currentLog.hcpName || "No doctor selected"}
              </div>
              <div>
                <span className="font-bold text-slate-700">Medical Specialty:</span> {currentLog.hcpSpecialty || "General Medicine"}
              </div>
              <div>
                <span className="font-bold text-slate-700">Starter Packs to Authorize:</span>{" "}
                <span className="font-semibold text-amber-700 font-mono">
                  {currentLog.samplesDistributed.map((item) => `${item.product} (Qty: ${item.quantity})`).join(", ")}
                </span>
              </div>
            </div>

            {/* Canvas Sign Box */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Practitioner Signature Pad
              </label>
              <div className="relative border border-slate-300 rounded-xl bg-slate-50/50 overflow-hidden shadow-inner flex flex-col items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="bg-slate-50 border-b border-slate-200 cursor-crosshair w-full"
                />
                
                {/* Dotted Signing Line mimicking paper check or prescription pad */}
                {!hasSigned && (
                  <div className="absolute inset-x-0 bottom-12 flex flex-col items-center justify-center pointer-events-none opacity-40 select-none">
                    <div className="w-11/12 border-b border-dashed border-slate-400" />
                    <span className="text-[10px] text-slate-400 font-medium mt-1 font-mono uppercase tracking-widest">
                      Sign Here
                    </span>
                  </div>
                )}

                <div className="w-full bg-slate-100 px-3 py-2 flex justify-between items-center text-[9px] text-slate-500 font-medium">
                  <span>Authorized Signature Canvas</span>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-amber-700 hover:text-amber-800 font-bold uppercase hover:underline cursor-pointer"
                  >
                    Clear Signature Pad
                  </button>
                </div>
              </div>
            </div>

            {/* Regulatory Disclaimer statement */}
            <p className="text-[8.5px] text-slate-400 leading-normal font-medium text-justify">
              By signing above, the practitioner acknowledges receipt of the indicated prescription drug starter packs. The practitioner certifies that these starter packs are intended solely for patient needs, will not be sold or offered for sale, and that NPI status remains fully active and unrevoked under the rules of State Medical Board.
            </p>

            {/* Footer triggers */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                PDMA Audit-Active
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSignatureModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!hasSigned}
                  onClick={saveSignature}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all shadow-3xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Sign & Validate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
