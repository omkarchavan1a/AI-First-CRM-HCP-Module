import { Activity, Database, RefreshCw, Layers } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { resetCurrentLog } from "../store/crmSlice";

export default function Header() {
  const dispatch = useAppDispatch();
  const { activeLangGraphNode, agentLoading } = useAppSelector((state) => state.crm);

  const getStatusColor = () => {
    switch (activeLangGraphNode) {
      case "GREETING": return "bg-blue-500 text-blue-100";
      case "DETAILING": return "bg-purple-500 text-purple-100";
      case "SAMPLES": return "bg-amber-500 text-amber-100";
      case "NEXT_STEPS": return "bg-indigo-500 text-indigo-100";
      case "COMPLETED": return "bg-emerald-500 text-emerald-100";
      default: return "bg-gray-500 text-gray-100";
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs px-6 py-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-teal-500 text-white rounded-lg">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                AI-First CRM
              </h1>
              <p className="text-xs text-slate-500">
                Healthcare Professional (HCP) Module &bull; Field Interaction Logger
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700">
            <Database className="h-3.5 w-3.5 text-slate-500" />
            <span>PostgreSQL: Connected</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700">
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            <span>State: </span>
            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${getStatusColor()}`}>
              {activeLangGraphNode}
            </span>
          </div>

          <button
            onClick={() => dispatch(resetCurrentLog())}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-600 rounded-lg text-xs font-medium cursor-pointer transition-colors ml-auto md:ml-0"
            title="Reset active logging session"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${agentLoading ? 'animate-spin' : ''}`} />
            <span>Reset Flow</span>
          </button>
        </div>
      </div>
    </header>
  );
}
