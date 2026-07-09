import React, { useState, useRef, useEffect } from "react";
import { Send, User, BrainCircuit, CornerDownLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { addManualChatMessage, sendChatToAgent } from "../store/crmSlice";

const PRESET_SCRIPTS = [
  {
    label: "Step 1: Start Visit",
    text: "I met with Dr. Jenkins from Mayo Clinic today to discuss CardioShield efficacy."
  },
  {
    label: "Step 2: Log Detailing",
    text: "We discussed Stage 2 hypertension. She was highly receptive but asked about renal patient safety."
  },
  {
    label: "Step 3: Add Samples",
    text: "I left 10 starter samples of CardioShield 10mg and verified the regulatory compliance checklist."
  },
  {
    label: "Step 4: Next Steps",
    text: "Requested follow-up clinical paper. Scheduled a follow-up meeting for next week on Wednesday."
  }
];

export default function ChatInterface() {
  const dispatch = useAppDispatch();
  const { agentChatHistory, agentLoading, currentLog, activeLangGraphNode } = useAppSelector(
    (state) => state.crm
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentChatHistory, agentLoading]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim() || agentLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user" as const,
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    dispatch(addManualChatMessage(userMsg));
    setInput("");

    // Send history + new message to server-side AI Agent for LangGraph step
    dispatch(
      sendChatToAgent({
         message: textToSend,
         history: [...agentChatHistory, userMsg],
         currentData: currentLog,
         activeNode: activeLangGraphNode
      })
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[620px] bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-3xs w-full">
      {/* Header Info - Matches Screenshot */}
      <div className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <div>
            <h3 className="text-[13px] font-bold text-blue-600">AI Assistant</h3>
            <p className="text-[10px] text-slate-400">
              Log Interaction details here via chat
            </p>
          </div>
        </div>
        <div className="text-[9px] font-mono font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
          Node: {activeLangGraphNode}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
        {/* Intro Help Bubble - Matches Screenshot Style */}
        <div className="p-4 rounded-xl text-[11.5px] leading-relaxed bg-[#e0f2fe]/60 text-sky-800 border border-[#bae6fd]/50">
          Log interaction details here (e.g., &quot;Met Dr. Smith, discussed Prodo-X efficacy, positive sentiment, shared brochure&quot;) or ask for help.
        </div>

        {agentChatHistory.map((msg) => {
          const isAgent = msg.sender === "agent";
          // Ignore the initial raw greetings to keep the clean look matching the screenshot
          if (msg.id.startsWith("init-")) return null;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] ${isAgent ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              <div
                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isAgent ? "bg-blue-600 text-white" : "bg-slate-800 text-white"
                }`}
              >
                {isAgent ? <BrainCircuit className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              <div>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-3xs ${
                    isAgent
                      ? "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                      : "bg-slate-800 text-slate-100 rounded-tr-none"
                  }`}
                >
                  {msg.text}
                </div>
                
                {isAgent && msg.thought && (
                  <div className="mt-1 px-1 flex items-center gap-1 text-[9px] font-mono text-slate-400">
                    <span className="font-semibold text-blue-600">Thought:</span>
                    <span className="truncate max-w-[180px]" title={msg.thought}>{msg.thought}</span>
                  </div>
                )}
                
                <div className="text-[9px] text-slate-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {agentLoading && (
          <div className="flex gap-2.5 max-w-[85%] mr-auto">
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center animate-pulse">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div className="bg-white text-slate-800 border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-3xs text-xs flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600"></span>
              </span>
              <span className="text-slate-500 italic font-mono text-[10px]">
                LangGraph routing & extracting fields...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Pill Scripts for Quick Testing */}
      <div className="bg-white border-t border-slate-100 p-3">
        <p className="text-[9px] font-semibold text-slate-400 uppercase px-1 mb-1.5 tracking-wider">
          Testing Copilot Quick Scenarios
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_SCRIPTS.map((script, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(script.text)}
              disabled={agentLoading}
              className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-1 rounded-lg transition-all cursor-pointer text-left disabled:opacity-50"
            >
              <span className="font-bold text-teal-600 block text-[8px] uppercase tracking-wider">
                {script.label}
              </span>
              {script.text.substring(0, 32)}...
            </button>
          ))}
        </div>
      </div>

      {/* Input Form - Styled to match screenshot */}
      <div className="bg-white border-t border-slate-100 p-4">
        <div className="flex gap-3 items-end">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={agentLoading}
            placeholder="Describe interaction..."
            className="flex-1 bg-white text-xs border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-800 rounded-xl p-3 focus:outline-none transition-all disabled:opacity-50 resize-none h-[54px]"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || agentLoading}
            className="h-[54px] w-[54px] rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-[11px] leading-tight flex flex-col items-center justify-center shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <span>AI</span>
            <span>Log</span>
          </button>
        </div>
      </div>
    </div>
  );
}
