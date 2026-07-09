import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch, useAppSelector } from "./store";
import { fetchHcps, fetchInteractions, resetCurrentLog } from "./store/crmSlice";
import ChatInterface from "./components/ChatInterface";
import StructuredForm from "./components/StructuredForm";
import TraceAndThoughts from "./components/TraceAndThoughts";
import HistoryLogs from "./components/HistoryLogs";
import ArchitectureBlueprint from "./components/ArchitectureBlueprint";
import { Database, BookOpen, Layers, Terminal, AlertCircle, Activity, RefreshCw, Server, HelpCircle } from "lucide-react";

function CRMAppContent() {
  const dispatch = useAppDispatch();
  const { error, activeLangGraphNode, agentLoading } = useAppSelector((state) => state.crm);
  const [showConsole, setShowConsole] = useState<boolean>(false);
  const [consoleTab, setConsoleTab] = useState<"trace" | "database" | "architecture">("trace");

  // Load initial HCPs and history records on mount
  useEffect(() => {
    dispatch(fetchHcps());
    dispatch(fetchInteractions());
  }, [dispatch]);

  const getStateDescription = () => {
    switch (activeLangGraphNode) {
      case "GREETING": return "Awaiting doctor selection or welcome detailing notes.";
      case "DETAILING": return "Extracting therapeutic topics & clinical trial mentions.";
      case "SAMPLES": return "Enforcing PhRMA drug sample regulatory & signature guards.";
      case "NEXT_STEPS": return "Tracking actionable next steps, follow-up dates & sentiment.";
      case "COMPLETED": return "Flow complete. Verification finished. Ready for SQL commit.";
      default: return "Monitoring agent state machine...";
    }
  };

  const getStatusColor = () => {
    switch (activeLangGraphNode) {
      case "GREETING": return "bg-blue-500 text-white";
      case "DETAILING": return "bg-purple-500 text-white";
      case "SAMPLES": return "bg-amber-500 text-white";
      case "NEXT_STEPS": return "bg-indigo-500 text-white";
      case "COMPLETED": return "bg-emerald-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-start items-center p-4 sm:p-6 md:p-8 select-none overflow-x-hidden font-sans">
      
      {/* Dynamic Error Toast/Banner */}
      {error && (
        <div className="w-full max-w-[1536px] mb-6 bg-red-50 border border-red-200/80 p-4 rounded-2xl flex items-center gap-3 text-xs text-red-700 animate-slideDown shadow-3xs">
          <AlertCircle className="h-4.5 w-4.5 text-red-600 flex-shrink-0" />
          <p className="font-semibold">
            System Notice: {error}. Make sure GEMINI_API_KEY is configured in your Secrets panel.
          </p>
        </div>
      )}

      {/* Main Bento Grid Canvas */}
      <div className="w-full max-w-[1536px] grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* TOP ROW: BENTO CARD A & B */}
        
        {/* Card A: Brand Title & Session Controller (col-span-8) */}
        <div className="col-span-1 lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-3xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="p-3 bg-blue-600 text-white rounded-xl shadow-xs">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                AI-First Medical Detailing CRM
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Healthcare Professional (HCP) Interaction & Field Detailing Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-600">
              <Server className="h-3.5 w-3.5 text-slate-500" />
              <span>PostgreSQL Connected</span>
            </div>

            <button
              onClick={() => dispatch(resetCurrentLog())}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-3xs"
              title="Reset current logging flow"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${agentLoading ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
              <span>Reset Session</span>
            </button>
          </div>
        </div>

        {/* Card B: Agent State Status (col-span-4) */}
        <div className="col-span-1 lg:col-span-4 bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-3xs hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Active Agent Node Monitor
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Live</span>
            </div>
          </div>

          <div className="my-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-semibold">LANGGRAPH STATE</span>
              <span className={`px-2.5 py-0.5 rounded-md font-extrabold font-mono text-xs shadow-xs tracking-wide ${getStatusColor()}`}>
                {activeLangGraphNode}
              </span>
            </div>
            
            <HelpCircle className="h-5 w-5 text-slate-600" title="State changes automatically as you fill fields or talk to the AI" />
          </div>

          <p className="text-[11px] text-slate-300 font-mono font-medium leading-relaxed italic border-t border-slate-800 pt-2">
            &quot;{getStateDescription()}&quot;
          </p>
        </div>

        {/* MIDDLE ROW: BENTO CARD C (FORM GRID) & D (COPILOT ASSISTANT) */}
        
        {/* Left Column (spans 8): Structured Form Bento cards */}
        <div className="col-span-1 lg:col-span-8">
          <StructuredForm />
        </div>

        {/* Right Column (spans 4): AI Assistant Chat */}
        <div className="col-span-1 lg:col-span-4 flex">
          <ChatInterface />
        </div>
      </div>

      {/* Discreet Developer Console Toggle (Preserves database & architecture features out-of-sight of the screenshot layout) */}
      <div className="w-full max-w-[1536px] mt-8 flex justify-between items-center px-2">
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider font-mono">
          Pharma-Detailing Agent Sandbox v1.2.0
        </p>
        <button
          onClick={() => setShowConsole(!showConsole)}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 hover:text-slate-800 cursor-pointer shadow-3xs transition-all"
        >
          <Terminal className="h-3.5 w-3.5 text-slate-500" />
          <span>{showConsole ? "Hide Developer Logs" : "Show Trace & SQL Audit Logs"}</span>
        </button>
      </div>

      {showConsole && (
        <div className="w-full max-w-[1536px] mt-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 animate-fadeIn">
          <div className="flex border-b border-slate-100 pb-2 gap-4">
            <button
              onClick={() => setConsoleTab("trace")}
              className={`flex items-center gap-1.5 pb-2 border-b-2 font-bold text-xs transition-all cursor-pointer ${
                consoleTab === "trace" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Execution State Trace</span>
            </button>
            <button
              onClick={() => setConsoleTab("database")}
              className={`flex items-center gap-1.5 pb-2 border-b-2 font-bold text-xs transition-all cursor-pointer ${
                consoleTab === "database" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Database className="h-4 w-4" />
              <span>SQL History Database</span>
            </button>
            <button
              onClick={() => setConsoleTab("architecture")}
              className={`flex items-center gap-1.5 pb-2 border-b-2 font-bold text-xs transition-all cursor-pointer ${
                consoleTab === "architecture" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>LangGraph Architecture</span>
            </button>
          </div>

          <div className="pt-1">
            {consoleTab === "trace" && <TraceAndThoughts />}
            {consoleTab === "database" && <HistoryLogs />}
            {consoleTab === "architecture" && <ArchitectureBlueprint />}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <CRMAppContent />
    </Provider>
  );
}

