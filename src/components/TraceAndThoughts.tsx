import { motion } from "motion/react";
import { Terminal, Cpu, ArrowRight, CornerRightDown } from "lucide-react";
import { useAppSelector } from "../store";

export default function TraceAndThoughts() {
  const { agentThoughts } = useAppSelector((state) => state.crm);

  return (
    <div className="bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl p-5 shadow-lg h-[520px] overflow-y-auto font-mono flex flex-col">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
        <Terminal className="h-4.5 w-4.5 text-emerald-400" />
        <div>
          <h3 className="text-xs font-semibold text-slate-200">LangGraph Execution Trace</h3>
          <p className="text-[9px] text-slate-500">
            Real-time conditional routing logic & state graph variables
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {agentThoughts.map((thought, idx) => (
          <div key={idx} className="relative pl-5 border-l border-slate-800 space-y-1 text-xs">
            {/* Timeline dot */}
            <div className="absolute -left-[6px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-slate-950 shadow-xs" />
            
            <div className="flex items-center gap-2 text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                {thought.node}
              </span>
              <span className="text-slate-600">
                {new Date(thought.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px] whitespace-pre-wrap pt-1">
              {thought.thought}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800 pt-3 mt-4 space-y-1.5 text-[10px] text-slate-500">
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-300">Python State Schema variables:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60 font-mono text-[9px] text-slate-400">
          <div>state["messages"]: List</div>
          <div>state["current_hcp"]: str</div>
          <div>state["compliance_ok"]: bool</div>
          <div>state["next_node"]: str</div>
        </div>
      </div>
    </div>
  );
}
