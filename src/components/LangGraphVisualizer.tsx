import { motion } from "motion/react";
import { User, MessageSquare, Shield, CalendarCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { useAppSelector } from "../store";

export default function LangGraphVisualizer() {
  const { activeLangGraphNode, currentLog } = useAppSelector((state) => state.crm);

  const nodes = [
    {
      id: "GREETING",
      label: "Greeting / ID",
      desc: "Identify HCP & specialty",
      icon: User,
      color: "border-blue-500 text-blue-600 bg-blue-50",
      activeColor: "border-blue-500 text-white bg-blue-600 shadow-blue-200 ring-4 ring-blue-100",
      completedColor: "border-emerald-500 text-emerald-600 bg-emerald-50",
      fields: [
        { name: "HCP Name", val: currentLog.hcpName },
        { name: "Specialty", val: currentLog.hcpSpecialty }
      ]
    },
    {
      id: "DETAILING",
      label: "Detailing Topic",
      desc: "Therapy details discussed",
      icon: MessageSquare,
      color: "border-purple-500 text-purple-600 bg-purple-50",
      activeColor: "border-purple-500 text-white bg-purple-600 shadow-purple-200 ring-4 ring-purple-100",
      completedColor: "border-emerald-500 text-emerald-600 bg-emerald-50",
      fields: [
        { name: "Topic", val: currentLog.detailingTopic },
        { name: "Products", val: currentLog.productsDiscussed.length > 0 ? currentLog.productsDiscussed.join(", ") : "" }
      ]
    },
    {
      id: "SAMPLES",
      label: "Drug Samples",
      desc: "Starter packs left",
      icon: Shield,
      color: "border-amber-500 text-amber-600 bg-amber-50",
      activeColor: "border-amber-500 text-white bg-amber-600 shadow-amber-200 ring-4 ring-amber-100",
      completedColor: "border-emerald-500 text-emerald-600 bg-emerald-50",
      fields: [
        { name: "Samples", val: currentLog.samplesDistributed.length > 0 ? `${currentLog.samplesDistributed.length} products` : "" }
      ]
    },
    {
      id: "NEXT_STEPS",
      label: "Next Steps",
      desc: "Scheduling & material",
      icon: CalendarCheck,
      color: "border-indigo-500 text-indigo-600 bg-indigo-50",
      activeColor: "border-indigo-500 text-white bg-indigo-600 shadow-indigo-200 ring-4 ring-indigo-100",
      completedColor: "border-emerald-500 text-emerald-600 bg-emerald-50",
      fields: [
        { name: "Follow Up", val: currentLog.nextSteps },
        { name: "Date", val: currentLog.followUpDate }
      ]
    },
    {
      id: "COMPLETED",
      label: "Verification",
      desc: "Regulatory sign-off",
      icon: CheckCircle2,
      color: "border-slate-500 text-slate-600 bg-slate-50",
      activeColor: "border-emerald-600 text-white bg-emerald-600 shadow-emerald-200 ring-4 ring-emerald-100",
      completedColor: "border-emerald-500 text-emerald-600 bg-emerald-50",
      fields: [
        { name: "Compliance", val: currentLog.complianceVerified ? "Verified" : "" }
      ]
    }
  ];

  const getNodeState = (nodeId: string) => {
    if (activeLangGraphNode === nodeId) return "active";
    const currentIndex = nodes.findIndex((n) => n.id === activeLangGraphNode);
    const targetIndex = nodes.findIndex((n) => n.id === nodeId);
    if (targetIndex < currentIndex) return "completed";
    return "inactive";
  };

  return (
    <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-lg border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase">
            LangGraph State Controller
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active LLM Node & conditional edge router routing status (simulated Python StateGraph)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Active Session
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
        {nodes.map((node, idx) => {
          const NodeIcon = node.icon;
          const state = getNodeState(node.id);
          
          let cardStyle = "";
          let iconStyle = "";
          
          if (state === "active") {
            cardStyle = `${node.activeColor} border`;
            iconStyle = "text-white";
          } else if (state === "completed") {
            cardStyle = `${node.completedColor} border`;
            iconStyle = "text-emerald-600";
          } else {
            cardStyle = "border-slate-800 bg-slate-900/50 text-slate-500 border";
            iconStyle = "text-slate-600";
          }

          return (
            <div key={node.id} className="relative flex flex-col justify-between h-full">
              {/* Connector Line */}
              {idx < nodes.length - 1 && (
                <div className="hidden sm:block absolute top-6 -right-6 w-12 h-0.5 z-0 bg-slate-800">
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: "0%" }}
                    animate={{ width: state === "completed" ? "100%" : "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              <motion.div
                layoutId={`node-card-${node.id}`}
                className={`flex flex-col p-4 rounded-xl relative z-10 transition-all duration-300 min-h-[140px] ${cardStyle}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-1.5 rounded-lg ${state === "active" ? "bg-white/20" : "bg-slate-800"}`}>
                    <NodeIcon className={`h-4 w-4 ${iconStyle}`} />
                  </div>
                  {state === "completed" && (
                    <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                      Done
                    </span>
                  )}
                  {state === "active" && (
                    <span className="text-[10px] font-semibold text-white bg-white/20 px-1.5 py-0.5 rounded-full animate-pulse">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className={`text-xs font-semibold ${state === "active" ? "text-white" : state === "completed" ? "text-slate-800" : "text-slate-400"}`}>
                    {node.label}
                  </h3>
                  <p className={`text-[10px] mt-0.5 ${state === "active" ? "text-white/80" : "text-slate-500"}`}>
                    {node.desc}
                  </p>
                </div>

                {/* Extracted Fields Preview */}
                <div className="mt-3 border-t border-slate-200/10 pt-2 space-y-1">
                  {node.fields.map((field) => {
                    const isFilled = !!field.val;
                    return (
                      <div key={field.name} className="flex items-center justify-between text-[9px]">
                        <span className="text-slate-500">{field.name}:</span>
                        <span className={`font-mono truncate max-w-[70px] ${isFilled ? "text-emerald-400 font-medium" : "text-slate-600 italic"}`}>
                          {isFilled ? field.val : "empty"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
