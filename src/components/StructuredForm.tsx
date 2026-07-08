import React, { useState } from "react";
import { Plus, Trash2, Check, AlertCircle, Save, HelpCircle, ShieldCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { updateCurrentLogField, saveInteraction } from "../store/crmSlice";
import { SampleDistributed } from "../types";

const PRODUCT_LIST = ["CardioShield", "LipidAway", "HyperTenSoothe", "OncoXen", "InsuloGlow"];

export default function StructuredForm() {
  const dispatch = useAppDispatch();
  const { currentLog, hcps, activeLangGraphNode } = useAppSelector((state) => state.crm);
  
  // Local state to add drug sample to list
  const [selectedSampleProduct, setSelectedSampleProduct] = useState(PRODUCT_LIST[0]);
  const [sampleQty, setSampleQty] = useState(5);

  const handleFieldChange = <K extends keyof typeof currentLog>(field: K, value: typeof currentLog[K]) => {
    dispatch(updateCurrentLogField({ field, value }));
  };

  const handleHcpSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    handleFieldChange("hcpName", selectedName);
  };

  const toggleProductDiscussed = (product: string) => {
    const current = [...currentLog.productsDiscussed];
    if (current.includes(product)) {
      handleFieldChange("productsDiscussed", current.filter((p) => p !== product));
    } else {
      handleFieldChange("productsDiscussed", [...current, product]);
    }
  };

  const addSampleItem = () => {
    if (!selectedSampleProduct) return;
    const current = [...currentLog.samplesDistributed];
    const existingIdx = current.findIndex((item) => item.product === selectedSampleProduct);
    
    if (existingIdx > -1) {
      const updated = [...current];
      updated[existingIdx] = {
        ...updated[existingIdx],
        quantity: updated[existingIdx].quantity + sampleQty
      };
      handleFieldChange("samplesDistributed", updated);
    } else {
      handleFieldChange("samplesDistributed", [
        ...current,
        { product: selectedSampleProduct, quantity: sampleQty }
      ]);
    }
  };

  const removeSampleItem = (index: number) => {
    const current = [...currentLog.samplesDistributed];
    handleFieldChange("samplesDistributed", current.filter((_, i) => i !== index));
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
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 h-[520px] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-xs font-semibold text-slate-800">Structured CRM Call Log Form</h3>
          <p className="text-[10px] text-slate-500">
            Real-time visual sync with the conversational extraction model
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-500">
          Sync Status: <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

      {/* Row 1: HCP & Specialty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Healthcare Professional *
          </label>
          <select
            value={currentLog.hcpName}
            onChange={handleHcpSelect}
            className="w-full bg-slate-50 text-xs border border-slate-200 focus:border-teal-500 focus:bg-white text-slate-800 rounded-lg p-2.5 focus:outline-hidden transition-colors"
          >
            <option value="">-- Choose HCP (from SQL database) --</option>
            {hcps.map((h) => (
              <option key={h.id} value={h.name}>
                {h.name} ({h.specialty} - {h.institution})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            HCP Specialty (Auto-detected)
          </label>
          <input
            type="text"
            readOnly
            value={currentLog.hcpSpecialty}
            placeholder="Specialty will auto-populate"
            className="w-full bg-slate-100 text-xs border border-slate-200 text-slate-500 rounded-lg p-2.5 outline-hidden cursor-not-allowed"
          />
        </div>
      </div>

      {/* Row 2: Detailing Topic */}
      <div>
        <label className="block text-[11px] font-medium text-slate-700 mb-1">
          Scientific Detailing Topic & Key Messages *
        </label>
        <textarea
          rows={2}
          value={currentLog.detailingTopic}
          onChange={(e) => handleFieldChange("detailingTopic", e.target.value)}
          placeholder="Describe the clinical efficacy discussed, safety parameters, or customer objections..."
          className="w-full bg-slate-50 text-xs border border-slate-200 focus:border-teal-500 focus:bg-white text-slate-800 rounded-lg p-2.5 focus:outline-hidden transition-colors resize-none"
        />
      </div>

      {/* Row 3: Products Discussed */}
      <div>
        <label className="block text-[11px] font-medium text-slate-700 mb-1">
          Therapeutic Products Discussed
        </label>
        <div className="flex flex-wrap gap-2 mt-1">
          {PRODUCT_LIST.map((prod) => {
            const isDiscussed = currentLog.productsDiscussed.includes(prod);
            return (
              <button
                type="button"
                key={prod}
                onClick={() => toggleProductDiscussed(prod)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                  isDiscussed
                    ? "bg-teal-50 border-teal-500 text-teal-700"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {isDiscussed && <Check className="h-3 w-3" />}
                <span>{prod}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 4: Drug Sample Distribution with PhRMA Compliance Check */}
      <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">
            Sample Distribution Engine
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">PDMA Compliant</span>
        </div>

        {/* Add Sample Tool */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <select
            value={selectedSampleProduct}
            onChange={(e) => setSelectedSampleProduct(e.target.value)}
            className="bg-white text-xs border border-slate-200 text-slate-700 rounded-lg p-2"
          >
            {PRODUCT_LIST.map((prod) => (
              <option key={prod} value={prod}>
                {prod} Starter Pack
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            max="100"
            value={sampleQty}
            onChange={(e) => setSampleQty(parseInt(e.target.value) || 1)}
            className="bg-white text-xs border border-slate-200 text-slate-800 rounded-lg p-2"
            placeholder="Quantity"
          />

          <button
            type="button"
            onClick={addSampleItem}
            className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2 px-3 rounded-lg cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Samples
          </button>
        </div>

        {/* Active Samples List */}
        {currentLog.samplesDistributed.length > 0 ? (
          <div className="space-y-1.5 mt-2 bg-white border border-slate-200/60 p-2.5 rounded-lg">
            {currentLog.samplesDistributed.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-50 px-2 py-1.5 rounded-md text-xs">
                <span className="font-semibold text-slate-700">
                  {item.product} Starter Pack
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium text-slate-500">Qty: {item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => removeSampleItem(idx)}
                    className="text-red-500 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 italic py-1">
            No pharmaceutical drug samples recorded in this interaction.
          </p>
        )}

        {/* Compliance Guard */}
        {currentLog.samplesDistributed.length > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2.5">
            <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-semibold text-amber-800 leading-tight">
                PDMA / PhRMA Code Signature Compliance Guard
              </p>
              <p className="text-[9px] text-amber-700 mt-0.5 leading-relaxed">
                By ticking this box, you verify that you have obtained the required clinical practitioner digital signature, validated inventory limits, and stored compliance papers.
              </p>
              <label className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-800 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentLog.complianceVerified}
                  onChange={(e) => handleFieldChange("complianceVerified", e.target.checked)}
                  className="rounded border-amber-300 text-teal-600 focus:ring-teal-500"
                />
                <span>I confirm PhRMA compliance & signature receipt</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Row 5: Next Steps, Follow Up Date & Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Next Action Steps
          </label>
          <input
            type="text"
            value={currentLog.nextSteps}
            onChange={(e) => handleFieldChange("nextSteps", e.target.value)}
            placeholder="e.g., Deliver Clinical Trial, Follow up Call"
            className="w-full bg-slate-50 text-xs border border-slate-200 focus:border-teal-500 focus:bg-white text-slate-800 rounded-lg p-2.5 focus:outline-hidden transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Follow Up Date
          </label>
          <input
            type="date"
            value={currentLog.followUpDate}
            onChange={(e) => handleFieldChange("followUpDate", e.target.value)}
            className="w-full bg-slate-50 text-xs border border-slate-200 focus:border-teal-500 focus:bg-white text-slate-800 rounded-lg p-2.5 focus:outline-hidden transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            HCP Reception / Sentiment
          </label>
          <select
            value={currentLog.feedbackSentiment}
            onChange={(e) => handleFieldChange("feedbackSentiment", e.target.value as any)}
            className="w-full bg-slate-50 text-xs border border-slate-200 focus:border-teal-500 focus:bg-white text-slate-800 rounded-lg p-2.5 focus:outline-hidden transition-colors"
          >
            <option value="">-- Choose Reception --</option>
            <option value="Positive">Positive / High Interest</option>
            <option value="Neutral">Neutral / Standard Visit</option>
            <option value="Critical">Critical / Skeptical / Refused</option>
          </select>
        </div>
      </div>

      {/* Form Submission */}
      <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
        <p className="text-[10px] text-slate-400">
          Current LangGraph State: <span className="font-semibold text-slate-600">{activeLangGraphNode}</span>
        </p>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-xs"
        >
          <Save className="h-4 w-4" />
          <span>Commit Log to PostgreSQL</span>
        </button>
      </div>
    </form>
  );
}
