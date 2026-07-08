import React, { useState } from "react";
import { Plus, Trash2, Check, Save, ShieldCheck, Search, Calendar, Clock, Mic, MicOff, Users, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { updateCurrentLogField, saveInteraction } from "../store/crmSlice";

const PRODUCT_LIST = ["CardioShield", "LipidAway", "HyperTenSoothe", "OncoXen", "InsuloGlow"];

export default function StructuredForm() {
  const dispatch = useAppDispatch();
  const { currentLog, hcps, activeLangGraphNode } = useAppSelector((state) => state.crm);
  
  // Local states for search/add material modal
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(PRODUCT_LIST[0]);
  const [materialQty, setMaterialQty] = useState(5);

  // Local state for Simulated Voice Recorder
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<any>(null);

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

  // Simulated voice logging transcription to populate form fields
  const handleToggleRecording = () => {
    if (isRecording) {
      // Stop recording
      clearInterval(recordingInterval);
      setIsRecording(false);
      setRecordingSeconds(0);
      
      // Seed values with dynamic, highly realistic medical CRM transcription details
      const randomSeed = Math.floor(Math.random() * 3);
      if (randomSeed === 0) {
        handleFieldChange("hcpName", "Dr. Sarah Jenkins");
        handleFieldChange("hcpSpecialty", "Cardiology");
        handleFieldChange("detailingTopic", "Presented the latest clinical trials of CardioShield 10mg indicating positive outcome for Stage 2 hypertension. The doctor requested safety parameters concerning pediatric and renal patients.");
        handleFieldChange("productsDiscussed", ["CardioShield"]);
        handleFieldChange("samplesDistributed", [{ product: "CardioShield", quantity: 10 }]);
        handleFieldChange("materialsShared", ["CardioShield"]);
        handleFieldChange("nextSteps", "Email renal safety statistics and follow up in two weeks.");
        handleFieldChange("followUpDate", "2026-07-22");
        handleFieldChange("feedbackSentiment", "Positive");
      } else if (randomSeed === 1) {
        handleFieldChange("hcpName", "Dr. Marcus Vance");
        handleFieldChange("hcpSpecialty", "Oncology");
        handleFieldChange("detailingTopic", "Detailed OncoXen therapeutic efficacy against metastatic tumor progression. Dr. Vance was highly receptive to clinical trial Phase III survival metrics.");
        handleFieldChange("productsDiscussed", ["OncoXen"]);
        handleFieldChange("samplesDistributed", [{ product: "OncoXen", quantity: 3 }]);
        handleFieldChange("materialsShared", ["OncoXen"]);
        handleFieldChange("nextSteps", "Arrange follow-up symposium invitation.");
        handleFieldChange("followUpDate", "2026-07-25");
        handleFieldChange("feedbackSentiment", "Positive");
      } else {
        handleFieldChange("hcpName", "Dr. Amit Patel");
        handleFieldChange("hcpSpecialty", "Endocrinology");
        handleFieldChange("detailingTopic", "Discussed InsuloGlow dual-action glycemic control. Dr. Patel noted positive interest but has reservations concerning gastrointestinal side effects.");
        handleFieldChange("productsDiscussed", ["InsuloGlow"]);
        handleFieldChange("samplesDistributed", [{ product: "InsuloGlow", quantity: 5 }]);
        handleFieldChange("materialsShared", ["InsuloGlow"]);
        handleFieldChange("nextSteps", "Deliver patient titration guidebook.");
        handleFieldChange("followUpDate", "2026-07-18");
        handleFieldChange("feedbackSentiment", "Neutral");
      }
    } else {
      // Start simulated recording timer
      setIsRecording(true);
      const interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
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
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-7 shadow-xs space-y-6 h-[620px] overflow-y-auto pr-3 scrollbar-thin">
      {/* Title block matching screenshot */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Log HCP Interaction
        </h2>
        <div className="text-xs font-semibold text-slate-400">
          Interaction Details
        </div>
      </div>

      {/* Row 1: HCP Name & Interaction Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {/* Row 2: Date & Time with Icons on the Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="w-full bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 rounded-lg p-2.5 pr-9 transition-colors focus:outline-none"
            />
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
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
              className="w-full bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 rounded-lg p-2.5 pr-9 transition-colors focus:outline-none"
            />
            <Clock className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 3: Attendees */}
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

      {/* Row 4: Topics Discussed */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Topics Discussed
        </label>
        <textarea
          rows={3}
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
          placeholder="Enter key discussion points..."
          className="w-full bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 rounded-lg p-3 transition-colors focus:outline-none resize-none"
        />

        {/* Summarize from Voice Note link styled perfectly like the screenshot */}
        <div className="mt-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleToggleRecording}
            className={`flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-all ${
              isRecording ? "animate-pulse font-bold text-red-600" : ""
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            <span>
              {isRecording ? `Recording... (${recordingSeconds}s)` : "Summarize from Voice Note (Requires Consent)"}
            </span>
          </button>
          
          {isRecording && (
            <div className="flex gap-0.5 items-center">
              <span className="h-3 w-1 bg-red-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="h-4.5 w-1 bg-red-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="h-2 w-1 bg-red-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
              <span className="h-3.5 w-1 bg-red-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>
      </div>

      {/* Row 5: Materials Shared & Samples Distributed */}
      <div className="pt-2 space-y-2">
        <span className="block text-xs font-semibold text-slate-400">
          Materials Shared / Samples Distributed
        </span>
        <span className="block text-xs font-semibold text-slate-700">
          Materials Shared
        </span>

        {/* Materials list container */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 min-h-[90px] flex flex-col justify-between relative">
          {currentLog.samplesDistributed.length > 0 ? (
            <div className="space-y-2 w-full pb-10">
              {currentLog.samplesDistributed.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 border border-slate-200/60 rounded-lg text-xs">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">
                      {item.product} Starter Pack
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      PhRMA Regulatory tracking logged
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Qty: {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMaterialItem(item.product)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-4">
              No materials added.
            </p>
          )}

          {/* Search/Add Button exactly aligned bottom-right like the image */}
          <div className="absolute bottom-3 right-3">
            <button
              type="button"
              onClick={() => setIsAddingMaterial(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium py-1.5 px-3 border border-slate-200 rounded-lg shadow-2xs cursor-pointer transition-all"
            >
              <Search className="h-3.5 w-3.5 text-blue-500 font-bold" />
              <span>Search/Add</span>
              <span className="text-[9px] text-slate-400">▼</span>
            </button>
          </div>
        </div>

        {/* Compliance checklist */}
        {currentLog.samplesDistributed.length > 0 && (
          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl flex gap-2.5">
            <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-amber-800 leading-tight">
                PDMA / PhRMA Code Signature Compliance Guard
              </p>
              <label className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-800 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentLog.complianceVerified}
                  onChange={(e) => handleFieldChange("complianceVerified", e.target.checked)}
                  className="rounded border-amber-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Confirm PhRMA compliance & signature receipt</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Row 6: Next Steps, Follow Up Date & Sentiment (Hidden below scroll by default) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
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

      {/* Form Submit Footer */}
      <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
        <p className="text-[10px] text-slate-400">
          Sync status: <span className="text-emerald-500 font-bold">LIVE SQL LINK</span>
        </p>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-xs"
        >
          <Save className="h-4 w-4" />
          <span>Commit Log to PostgreSQL</span>
        </button>
      </div>

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
    </form>
  );
}
