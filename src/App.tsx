import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch, useAppSelector } from "./store";
import { fetchHcps, fetchInteractions, setActiveTab } from "./store/crmSlice";
import Header from "./components/Header";
import LangGraphVisualizer from "./components/LangGraphVisualizer";
import ChatInterface from "./components/ChatInterface";
import StructuredForm from "./components/StructuredForm";
import TraceAndThoughts from "./components/TraceAndThoughts";
import HistoryLogs from "./components/HistoryLogs";
import ArchitectureBlueprint from "./components/ArchitectureBlueprint";
import { MessageSquare, LayoutGrid, ClipboardList, BookOpen, AlertCircle } from "lucide-react";

function CRMAppContent() {
  const dispatch = useAppDispatch();
  const { activeTab, error } = useAppSelector((state) => state.crm);
  const [mainViewTab, setMainViewTab] = useState<"logger" | "history" | "architecture">("logger");

  // Load initial HCPs and history records on mount
  useEffect(() => {
    dispatch(fetchHcps());
    dispatch(fetchInteractions());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* 1. Header */}
      <Header />

      {/* 2. Error Toast/Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3.5 flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="font-medium">
            System Notice: {error}. (Ensure your GEMINI_API_KEY is properly added under Secrets if running the conversational copilot).
          </p>
        </div>
      )}

      {/* 3. Main Stage Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {/* Navigation Tabs for Main Views */}
        <div className="flex border-b border-slate-200/80 gap-1 pb-px">
          <button
            onClick={() => setMainViewTab("logger")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-xs transition-all cursor-pointer ${
              mainViewTab === "logger"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Active Detailing Logger Dashboard</span>
          </button>

          <button
            onClick={() => setMainViewTab("history")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-xs transition-all cursor-pointer ${
              mainViewTab === "history"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Interaction Database (SQL)</span>
          </button>

          <button
            onClick={() => setMainViewTab("architecture")}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-xs transition-all cursor-pointer ${
              mainViewTab === "architecture"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Architecture & Blueprint Code</span>
          </button>
        </div>

        {/* VIEW 1: Active Logger Dashboard */}
        {mainViewTab === "logger" && (
          <div className="space-y-6 animate-fadeIn">
            {/* LangGraph Active Node Visualizer */}
            <LangGraphVisualizer />

            {/* Split Screen Logging Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Logging Inputs (Conversational or Structured) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-1.5 pl-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Logging Input Method
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => dispatch(setActiveTab("chat"))}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        activeTab === "chat"
                          ? "bg-teal-600 text-white shadow-xs"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                      }`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>AI Conversational Chat</span>
                    </button>
                    <button
                      onClick={() => dispatch(setActiveTab("form"))}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        activeTab === "form"
                          ? "bg-teal-600 text-white shadow-xs"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                      }`}
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span>Structured Form</span>
                    </button>
                  </div>
                </div>

                {activeTab === "chat" ? <ChatInterface /> : <StructuredForm />}
              </div>

              {/* Right Column: Execution Variable Trace */}
              <div className="lg:col-span-5">
                <TraceAndThoughts />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Audit Logs Database */}
        {mainViewTab === "history" && (
          <div className="animate-fadeIn">
            <HistoryLogs />
          </div>
        )}

        {/* VIEW 3: Blueprint Explorer */}
        {mainViewTab === "architecture" && (
          <div className="animate-fadeIn">
            <ArchitectureBlueprint />
          </div>
        )}

      </main>
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
