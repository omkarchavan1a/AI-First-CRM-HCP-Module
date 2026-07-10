import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch, useAppSelector } from "./store";
import { fetchHcps, fetchInteractions, resetCurrentLog } from "./store/crmSlice";
import ChatInterface from "./components/ChatInterface";
import StructuredForm from "./components/StructuredForm";
import TraceAndThoughts from "./components/TraceAndThoughts";
import HistoryLogs from "./components/HistoryLogs";
import ArchitectureBlueprint from "./components/ArchitectureBlueprint";
import { Database, BookOpen, Layers, Terminal, AlertCircle, Activity, RefreshCw, Server, HelpCircle, Lock, Unlock, ShieldAlert, Sparkles, Map, Play, ArrowRight, CheckCircle2, ChevronRight, X, HeartPulse, UserCheck, Mic, ShieldCheck, PenTool } from "lucide-react";

function CRMAppContent() {
  const dispatch = useAppDispatch();
  const { error, activeLangGraphNode, agentLoading } = useAppSelector((state) => state.crm);
  const [showConsole, setShowConsole] = useState<boolean>(false);
  const [consoleTab, setConsoleTab] = useState<"trace" | "database" | "architecture">("trace");

  // Client Walkthrough state
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  // Secure terminal screen lock states
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);

  const handleUnlock = (digit?: string) => {
    let currentPin = pinInput;
    if (digit) {
      if (currentPin.length >= 4) return;
      currentPin += digit;
      setPinInput(currentPin);
    }
    
    if (currentPin === "1234") {
      setIsLocked(false);
      setPinInput("");
      setPinError(null);
    } else if (currentPin.length === 4) {
      setPinError("Access Denied. Wrong PIN.");
      setPinInput("");
    }
  };

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
            <button
              onClick={() => {
                setIsTourOpen(true);
                setTourStep(0);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs animate-pulse"
              title="Step-by-step Interactive Client Walkthrough Map"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-100" />
              <span>Interactive Flow Map</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-600">
              <Server className="h-3.5 w-3.5 text-slate-500" />
              <span>PostgreSQL Connected</span>
            </div>

            <button
              onClick={() => setIsLocked(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-3xs"
              title="Lock terminal to secure HIPAA PHI records"
            >
              <Lock className="h-3.5 w-3.5 text-amber-500" />
              <span>Lock Terminal</span>
            </button>

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

      {/* Secure Lock Screen overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center font-sans animate-fadeIn text-white p-4 select-none">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <span className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl animate-pulse">
                <Lock className="h-10 w-10 text-red-500" />
              </span>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                HIPAA Protected Terminal Locked
              </h2>
              <p className="text-xs text-slate-500 max-w-sm">
                This screen contains highly regulated practitioner detailing logs and FDA drug sample receipts. Enter your security PIN to resume.
              </p>
            </div>

            {/* PIN Display */}
            <div className="space-y-2">
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-4 w-4 rounded-full border-2 transition-all ${
                      pinInput.length > idx
                        ? "bg-amber-500 border-amber-500 scale-110 shadow-lg shadow-amber-500/30"
                        : "border-slate-700"
                    }`}
                  />
                ))}
              </div>
              
              {pinError ? (
                <p className="text-[10px] text-red-500 font-bold font-mono animate-bounce">{pinError}</p>
              ) : (
                <p className="text-[10px] text-slate-400 font-semibold font-mono">
                  Sandbox Bypass Key: <span className="text-amber-500 font-extrabold">1234</span>
                </p>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setPinError(null);
                    handleUnlock(num);
                  }}
                  className="h-14 w-14 bg-slate-900 border border-slate-800 hover:bg-slate-800 active:bg-slate-900 text-lg font-bold rounded-full flex items-center justify-center transition-all cursor-pointer shadow-3xs"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setPinInput("");
                  setPinError(null);
                }}
                className="h-14 w-14 text-xs font-bold text-slate-500 hover:text-white flex items-center justify-center cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  setPinError(null);
                  handleUnlock("0");
                }}
                className="h-14 w-14 bg-slate-900 border border-slate-800 hover:bg-slate-800 active:bg-slate-900 text-lg font-bold rounded-full flex items-center justify-center transition-all cursor-pointer shadow-3xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => {
                  if (pinInput.length > 0) {
                    setPinInput(pinInput.slice(0, -1));
                    setPinError(null);
                  }
                }}
                className="h-14 w-14 text-xs font-bold text-slate-500 hover:text-white flex items-center justify-center cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Client Tour & Workflow Map Modal */}
      {isTourOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none font-sans">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col md:flex-row overflow-hidden animate-zoomIn h-[90vh] md:h-[620px]">
            
            {/* Left side: Navigation Step Timeline */}
            <div className="w-full md:w-[280px] bg-slate-900 text-white p-5 flex flex-col justify-between border-r border-slate-800">
              <div className="space-y-6">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-blue-600 rounded-lg text-white">
                    <Map className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
                      Client Tour Map
                    </h3>
                    <p className="text-[9px] text-slate-400 font-medium">
                      CRM Workflow Guide
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {[
                    { label: "1. Lock Terminal", detail: "HIPAA Security Guard" },
                    { label: "2. Verify Physician", detail: "NPI / License Board Check" },
                    { label: "3. AI Voice Detailing", detail: "Gemini Clinical Extractor" },
                    { label: "4. HIPAA PHI Scrubbing", detail: "Patient Privacy Shield" },
                    { label: "5. Capture Signature", detail: "PDMA FDA Sign-off" },
                    { label: "6. Ledger Commit", detail: "PostgreSQL Database Record" }
                  ].map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTourStep(idx)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-3 cursor-pointer border ${
                        tourStep === idx
                          ? "bg-slate-800 border-slate-700 text-white shadow-inner font-semibold"
                          : "bg-transparent border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                      }`}
                    >
                      <span className={`h-6 w-6 rounded-lg text-[10px] font-black flex items-center justify-center ${
                        tourStep === idx ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] truncate leading-normal">{step.label}</p>
                        <p className={`text-[8px] truncate ${tourStep === idx ? "text-slate-300" : "text-slate-500"}`}>{step.detail}</p>
                      </div>
                      {tourStep > idx && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-slate-500 text-[8.5px] leading-relaxed">
                PIN: <span className="text-amber-500 font-bold">1234</span> | Powered by Gemini & Node
              </div>
            </div>

            {/* Right side: Detailed Actionable Content */}
            <div className="flex-1 p-6 flex flex-col justify-between bg-slate-50 overflow-y-auto">
              
              {/* Top Row: Title & Close Button */}
              <div className="flex justify-between items-start border-b border-slate-200/50 pb-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    {tourStep === 0 && <Lock className="h-4.5 w-4.5" />}
                    {tourStep === 1 && <UserCheck className="h-4.5 w-4.5" />}
                    {tourStep === 2 && <Mic className="h-4.5 w-4.5" />}
                    {tourStep === 3 && <ShieldAlert className="h-4.5 w-4.5 text-red-600" />}
                    {tourStep === 4 && <PenTool className="h-4.5 w-4.5" />}
                    {tourStep === 5 && <Database className="h-4.5 w-4.5" />}
                  </span>
                  <div>
                    <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-wider font-mono">
                      Workflow Milestone {tourStep + 1} of 6
                    </span>
                    <h2 className="text-sm font-black text-slate-900 leading-tight">
                      {tourStep === 0 && "Terminal Privacy Lock Screen"}
                      {tourStep === 1 && "Physician Registry & License Check"}
                      {tourStep === 2 && "Voice Detailing Copilot & Gemini AI"}
                      {tourStep === 3 && "Active HIPAA PHI Guard (Privacy Scrub)"}
                      {tourStep === 4 && "FDA Drug Sample Signature & SHA Hash"}
                      {tourStep === 5 && "Cryptographic Ledger Save & Database Console"}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setIsTourOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Middle Row: Content and Instruction Body */}
              <div className="my-5 flex-1 space-y-4">
                
                {/* Description card */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-3xs">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                    Regulatory & Technical Context
                  </span>
                  <p className="text-[11.5px] text-slate-600 leading-relaxed font-medium">
                    {tourStep === 0 && "Medical sales representatives operate in busy clinic hallways and clinical workspaces. Leaving a detailing terminal unlocked risks accidental exposure of protected health information (PHI). This secure screen lock isolates all database queries, requiring a security PIN key to resume operations."}
                    {tourStep === 1 && "Under regulatory laws, pharmaceutical representatives are prohibited from distributing drug samples or detailing clinics without verifying the clinician's credentials. This system queries real-time medical boards, presenting state license numbers and NPI active verifications directly inside the detailing window."}
                    {tourStep === 2 && "Rather than requiring long charting forms, representatives simply dictate clinical visits using real-time microphones or preloaded scripts. The Google Gemini API parses the text, extracts therapeutic topics, next steps, and follow-ups, and maps them to structured database schema fields instantly."}
                    {tourStep === 3 && "Federal HIPAA regulations enforce strict policies against saving patient identities inside representative CRM records. The CRM scans topics in real-time for names, SSNs, and medical record numbers. If detected, the system triggers alerts and provides a one-click Automated De-Identification scrubbing function."}
                    {tourStep === 4 && "The Prescription Drug Marketing Act (PDMA) requires a physical signature for distributed prescription samples. This interactive touch/mouse signature pad records doctor sign-offs, renders the verified signature inside the database logs, and seals the record with an immutable SHA-256 validation ledger hash."}
                    {tourStep === 5 && "Saving committed detailing records sends structured JSON payloads directly to Node REST endpoints, persisting inputs securely into standard database tables. The Developer Drawer Console lets client visitors review the database ledger rows, trace Gemini model logs, and analyze LangGraph decision states."}
                  </p>
                </div>

                {/* Walkthrough Actionable Steps */}
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
                  <span className="text-[8px] font-extrabold text-blue-700 uppercase tracking-wider block font-mono">
                    How to Demonstrate this Live
                  </span>
                  <p className="text-[10.5px] text-blue-900 leading-normal font-semibold">
                    {tourStep === 0 && "1. Close this tour guide modal. 2. Click 'Lock Terminal' in the top-right corner. 3. Enter '1234' on the PIN keypad to see the terminal unlock and restore state."}
                    {tourStep === 1 && "1. Go to the 'Structured Detailing Form' (left card). 2. Choose 'Dr. Marcus Vance' in the Healthcare Professional selector. 3. Look at the verified State License & active validation widget."}
                    {tourStep === 2 && "1. Scroll down to the bottom of the structured form. 2. Click 'Summarize from Voice Note'. 3. Select 'CardioShield Visit' script from the preloaded menu. 4. Click 'Summarize & Extract' and watch the form populate!"}
                    {tourStep === 3 && "1. Inside 'Topics Discussed', type: 'Met Dr. Jenkins regarding patient John Doe DOB 12/12/1975'. 2. Review the red HIPAA alert. 3. Click 'Run Automated HIPAA De-Identification' to scrub and anonymize the text."}
                    {tourStep === 4 && "1. Add a sample product to the starter list. 2. Tap the 'Capture HCP Electronic Signature' button. 3. Sign on the canvas signature line and click 'Sign & Validate' to see the audit hash generated."}
                    {tourStep === 5 && "1. Complete and save the log. 2. Click 'Show Trace & SQL Audit Logs' at the bottom. 3. Go to the 'SQL History Database' tab to review the generated row, including the state license and active signature signature."}
                  </p>
                </div>
              </div>

              {/* Bottom Row: Controls */}
              <div className="border-t border-slate-200 pt-4 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  {tourStep > 0 && (
                    <button
                      onClick={() => setTourStep(tourStep - 1)}
                      className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-bold cursor-pointer transition-all"
                    >
                      Back
                    </button>
                  )}
                  {tourStep === 0 && (
                    <button
                      onClick={() => {
                        setIsLocked(true);
                        setIsTourOpen(false);
                      }}
                      className="px-3.5 py-1.5 text-xs text-slate-700 border border-slate-300 hover:bg-slate-200/50 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1 bg-white animate-pulse"
                    >
                      <Lock className="h-3 w-3 text-amber-500" />
                      <span>Test Terminal Lock Screen</span>
                    </button>
                  )}
                  {tourStep === 5 && (
                    <button
                      onClick={() => {
                        setShowConsole(true);
                        setConsoleTab("database");
                        setIsTourOpen(false);
                      }}
                      className="px-3 py-1 text-[10px] text-blue-700 border border-blue-200 bg-blue-50/50 hover:bg-blue-100 rounded-lg font-extrabold cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Database className="h-3 w-3" />
                      <span>Jump to Live Database Tab</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTourOpen(false)}
                    className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                  >
                    Close Walkthrough
                  </button>

                  {tourStep < 5 ? (
                    <button
                      onClick={() => setTourStep(tourStep + 1)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <span>Next Milestone</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsTourOpen(false)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Finish Walkthrough
                    </button>
                  )}
                </div>
              </div>

            </div>
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

