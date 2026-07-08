import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, BrainCircuit, CornerDownLeft } from "lucide-react";
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend(input);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Header Info */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-teal-500 text-white rounded-md">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-800">AI Copilot Chat logger</h3>
            <p className="text-[10px] text-slate-500">
              Conversational detailing extractor (powered by gemma2-9b-it via Groq schema)
            </p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Node: {activeLangGraphNode}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {agentChatHistory.map((msg) => {
          const isAgent = msg.sender === "agent";
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] ${isAgent ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              <div
                className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isAgent ? "bg-teal-500 text-white" : "bg-slate-800 text-white"
                }`}
              >
                {isAgent ? <BrainCircuit className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              <div>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    isAgent
                      ? "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                      : "bg-slate-800 text-slate-100 rounded-tr-none"
                  }`}
                >
                  {msg.text}
                </div>
                
                {isAgent && msg.thought && (
                  <div className="mt-1 px-1 flex items-center gap-1 text-[9px] font-mono text-slate-400">
                    <span className="font-semibold text-teal-600">Thought:</span>
                    <span className="truncate max-w-[200px]" title={msg.thought}>{msg.thought}</span>
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
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-teal-500 text-white flex items-center justify-center animate-pulse">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div className="bg-white text-slate-800 border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-2xs text-xs flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
              </span>
              <span className="text-slate-500 italic font-mono text-[10px]">
                LangGraph routing & extracting fields...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Pill Scripts */}
      <div className="bg-white border-t border-slate-200/60 p-2">
        <p className="text-[9px] font-semibold text-slate-400 uppercase px-2 mb-1.5 tracking-wider">
          Testing Copilot Pill Presets (Click to log conversationally)
        </p>
        <div className="flex flex-wrap gap-1.5 px-1.5">
          {PRESET_SCRIPTS.map((script, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(script.text)}
              disabled={agentLoading}
              className="text-[10px] bg-slate-100 hover:bg-slate-200/80 active:bg-slate-300/60 border border-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors cursor-pointer text-left disabled:opacity-50"
            >
              <span className="font-semibold text-teal-600 block text-[8px] uppercase tracking-tight">
                {script.label}
              </span>
              {script.text.substring(0, 48)}...
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-slate-200 p-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={agentLoading}
            placeholder="Type your detailing details or talk to your copilot..."
            className="w-full bg-slate-50 text-xs border border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:bg-white text-slate-800 rounded-xl pl-3.5 pr-20 py-3 focus:outline-hidden transition-all disabled:opacity-50"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] text-slate-400 border border-slate-200 bg-white px-1.5 py-0.5 rounded font-mono">
              <CornerDownLeft className="h-2 w-2" /> Enter
            </span>
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || agentLoading}
              className="p-1.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
