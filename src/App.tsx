import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch, useAppSelector } from "./store";
import { fetchHcps, fetchInteractions } from "./store/crmSlice";
import ChatInterface from "./components/ChatInterface";
import StructuredForm from "./components/StructuredForm";
import TraceAndThoughts from "./components/TraceAndThoughts";
import HistoryLogs from "./components/HistoryLogs";
import ArchitectureBlueprint from "./components/ArchitectureBlueprint";
import { Database, BookOpen, Layers, Terminal, AlertCircle } from "lucide-react";

function CRMAppContent() {
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.crm);
  const [showConsole, setShowConsole] = useState<boolean>(false);
  const [consoleTab, setConsoleTab] = useState<"trace" | "database" | "architecture">("trace");

  // Load initial HCPs and history records on mount
  useEffect(() => {
    dispatch(fetchHcps());
    dispatch(fetchInteractions());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-start items-center p-3 sm:p-5 md:p-6 select-none overflow-x-hidden">
      {/* Dynamic Error Toast/Banner */}
      {error && (
        <div className="w-full max-w-[1240px] mb-4 bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2.5 text-xs text-red-700 animate-slideDown shadow-3xs">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="font-medium">
            System Notice: {error}. Make sure GEMINI_API_KEY is configured in your Secrets panel.
          </p>
        </div>
      )}

      {/* Main Split Screen Side-by-Side - matches the screenshot perfectly */}
      <div className="w-full max-w-[1240px] grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Logging Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <StructuredForm />
        </div>

        {/* Right Column: AI Assistant Chat */}
        <div className="lg:col-span-5 xl:col-span-4">
          <ChatInterface />
        </div>
      </div>

      {/* Discreet Developer Console Toggle (Preserves database & architecture features out-of-sight of the screenshot layout) */}
      <div className="w-full max-w-[1240px] mt-6 flex justify-between items-center px-2">
        <p className="text-[10px] text-slate-400 font-medium">
          Life-Sciences Interaction Detailing CRM
        </p>
        <button
          onClick={() => setShowConsole(!showConsole)}
          className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-[10px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer shadow-3xs transition-all"
        >
          <Terminal className="h-3 w-3" />
          <span>{showConsole ? "Hide Developer Console" : "Show Trace & SQL Database"}</span>
        </button>
      </div>

      {showConsole && (
        <div className="w-full max-w-[1240px] mt-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 animate-fadeIn">
          <div className="flex border-b border-slate-100 pb-2 gap-4">
            <button
              onClick={() => setConsoleTab("trace")}
              className={`flex items-center gap-1.5 pb-2 border-b-2 font-semibold text-xs transition-all cursor-pointer ${
                consoleTab === "trace" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Execution State Trace</span>
            </button>
            <button
              onClick={() => setConsoleTab("database")}
              className={`flex items-center gap-1.5 pb-2 border-b-2 font-semibold text-xs transition-all cursor-pointer ${
                consoleTab === "database" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>SQL History Database</span>
            </button>
            <button
              onClick={() => setConsoleTab("architecture")}
              className={`flex items-center gap-1.5 pb-2 border-b-2 font-semibold text-xs transition-all cursor-pointer ${
                consoleTab === "architecture" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>LangGraph Architecture</span>
            </button>
          </div>

          <div className="pt-2">
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
