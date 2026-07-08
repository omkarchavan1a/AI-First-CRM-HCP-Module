import { useState } from "react";
import { Code, Server, Database, Layers, Check, Copy, Cpu } from "lucide-react";

export default function ArchitectureBlueprint() {
  const [activeSubTab, setActiveSubTab] = useState<"langgraph" | "tools" | "fastapi" | "sql" | "redux">("langgraph");
  const [copied, setCopied] = useState(false);

  const copyCodeToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets = {
    langgraph: `# =====================================================================
# StateGraph Definition using LangGraph for CRM HCP Logging Flow
# =====================================================================
from typing import TypedDict, List, Dict, Any, Literal
from langgraph.graph import StateGraph, START, END
from pydantic import BaseModel, Field

# 1. State Definition
class AgentState(TypedDict):
    messages: List[Dict[str, str]]
    hcp_name: str
    hcp_specialty: str
    detailing_topic: str
    products_discussed: List[str]
    samples_distributed: List[Dict[str, Any]]
    next_steps: str
    follow_up_date: str
    feedback_sentiment: str
    compliance_verified: bool
    active_node: Literal['GREETING', 'DETAILING', 'SAMPLES', 'NEXT_STEPS', 'COMPLETED']
    thought: str

# 2. Node Functions
def process_greeting_node(state: AgentState) -> Dict[str, Any]:
    """Node responsible for Welcoming the Rep and Identifying HCP."""
    user_msg = state["messages"][-1]["content"]
    # LLM extracts HCP Name & Specialty from message...
    extracted = llm_extract_greeting_fields(user_msg)
    
    next_node = "DETAILING" if extracted.hcp_name else "GREETING"
    thought = f"Extracted hcp_name='{extracted.hcp_name}'. Routing to {next_node}."
    
    return {
        "hcp_name": extracted.hcp_name,
        "hcp_specialty": extracted.hcp_specialty,
        "active_node": next_node,
        "thought": thought
    }

def process_detailing_node(state: AgentState) -> Dict[str, Any]:
    """Node processing Drug Detailing Topics & Messages."""
    user_msg = state["messages"][-1]["content"]
    extracted = llm_extract_detailing_fields(user_msg)
    
    next_node = "SAMPLES" if extracted.detailing_topic else "DETAILING"
    thought = f"Recorded detailing topic: '{extracted.detailing_topic}'. Moving to SAMPLES."
    
    return {
        "detailing_topic": extracted.detailing_topic,
        "products_discussed": extracted.products,
        "active_node": next_node,
        "thought": thought
    }

def process_samples_node(state: AgentState) -> Dict[str, Any]:
    """Node verifying sample distribution and PDMA compliance."""
    user_msg = state["messages"][-1]["content"]
    extracted = llm_extract_sample_fields(user_msg)
    
    next_node = "NEXT_STEPS"
    thought = f"Logged {len(extracted.samples)} drug samples. Compliance verified={extracted.verified}."
    
    return {
        "samples_distributed": extracted.samples,
        "compliance_verified": extracted.verified,
        "active_node": next_node,
        "thought": thought
    }

def process_next_steps_node(state: AgentState) -> Dict[str, Any]:
    """Node finalizing meeting scheduling, action items & follow-up."""
    user_msg = state["messages"][-1]["content"]
    extracted = llm_extract_next_steps_fields(user_msg)
    
    next_node = "COMPLETED"
    thought = f"Established next steps: '{extracted.next_steps}' for {extracted.date}."
    
    return {
        "next_steps": extracted.next_steps,
        "follow_up_date": extracted.date,
        "active_node": next_node,
        "thought": thought
    }

# 3. Router logic
def router_edge(state: AgentState) -> str:
    """Conditional Edge Router looking at current active_node."""
    return state["active_node"]

# 4. Initialize StateGraph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("GREETING", process_greeting_node)
workflow.add_node("DETAILING", process_detailing_node)
workflow.add_node("SAMPLES", process_samples_node)
workflow.add_node("NEXT_STEPS", process_next_steps_node)

# Add Routing edges
workflow.add_conditional_edges(
    START,
    router_edge,
    {
        "GREETING": "GREETING",
        "DETAILING": "DETAILING",
        "SAMPLES": "SAMPLES",
        "NEXT_STEPS": "NEXT_STEPS",
    }
)

# Connect sequential flow edges
workflow.add_edge("GREETING", "DETAILING")
workflow.add_edge("DETAILING", "SAMPLES")
workflow.add_edge("SAMPLES", "NEXT_STEPS")
workflow.add_edge("NEXT_STEPS", END)

# Compile LangGraph State Machine applet
app = workflow.compile()`,

    tools: `# =====================================================================
# LangGraph AI Agent Tool Definitions (Minimum 5 Specific Sales Tools)
# =====================================================================
from typing import Dict, Any, List, Optional
from langchain_core.tools import tool

# 1. log_interaction_tool: Detail how this captures interaction data (with LLM entity extraction)
@tool
def log_interaction_tool(
    hcp_id: str,
    raw_unstructured_text: str,
    override_fields: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Captures raw unstructured medical sales rep interaction notes, uses the 
    underlying LLM (e.g., gemma2-9b-it on Groq) for summarization, entity 
    extraction (drug names, sentiments, next steps), and updates the 
    structured CRM form variables with strict validation.
    """
    extracted_entities = llm_extract_and_summarize(raw_unstructured_text)
    final_payload = merge_and_validate(extracted_entities, override_fields)
    return {
        "status": "success",
        "saved_interaction_id": save_to_db(hcp_id, final_payload),
        "data": final_payload
    }

# 2. edit_interaction_tool: Detail how this tool allows modification of logged data
@tool
def edit_interaction_tool(
    interaction_id: str,
    updated_fields: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Allows safe modification and field-level updates to an already logged 
    or drafted interaction record. Running this tool updates the database log, 
    re-validates compliance triggers, and synchronizes the active state cache.
    """
    # 1. Fetch current interaction state
    current_record = fetch_from_db(interaction_id)
    # 2. Apply modifications securely
    new_record = {**current_record, **updated_fields}
    # 3. Re-run compliance validation
    run_compliance_checker(new_record)
    # 4. Commit updates to MySQL/Postgres SQL database
    commit_db_changes(interaction_id, new_record)
    return {"status": "updated", "interaction_id": interaction_id, "data": new_record}

# 3. search_hcp_database_tool: Look up Healthcare Professionals dynamically
@tool
def search_hcp_database_tool(
    query_string: str,
    specialty_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Queries the SQL database of Healthcare Professionals (HCPs) to retrieve 
    profile cards, valid licenses, contact emails, and active institutions.
    """
    return execute_postgres_query(
        "SELECT id, name, specialty, institution FROM hcps WHERE name LIKE %s", 
        (f"%{query_string}%",)
    )

# 4. retrieve_product_materials_tool: Fetch compliant medical brochure & sample limits
@tool
def retrieve_product_materials_tool(
    product_name: str
) -> Dict[str, Any]:
    """
    Fetches certified medical brochures, trial PDFs, or sample indications 
    for the specific drug product discussed during detailing sessions.
    """
    return fetch_product_metadata(product_name)

# 5. check_phrma_compliance_tool: Validate sample distributions against state rules
@tool
def check_phrma_compliance_tool(
    hcp_id: str,
    product_name: str,
    sample_quantity: int
) -> Dict[str, Any]:
    """
    Ensures absolute compliance under PhRMA and PDMA guidelines. 
    Verifies that the requested quantity of drug starter samples is within 
    state regulatory limits, matches practitioner specialty, and flags 
    necessary signatures needed for interaction logs.
    """
    remaining_limit = get_hcp_annual_sample_allowance(hcp_id, product_name)
    is_valid = (sample_quantity <= remaining_limit)
    return {
        "compliance_verified": is_valid,
        "remaining_allowance": remaining_limit,
        "warning_triggered": not is_valid,
        "message": "Authorized sample limits verified." if is_valid else "PDMA state limit exceeded!"
    }`,

    fastapi: `# =====================================================================
# Python FastAPI Controller running Groq gemma2-9b-it schema
# =====================================================================
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import groq

app = FastAPI(title="HCP Interaction API", version="1.0.0")

# 1. Pydantic Schemas for Request & Response validation
class SampleItem(BaseModel):
    product: str = Field(..., description="Name of the therapeutic drug starter sample")
    quantity: int = Field(..., description="Quantity of starter samples distributed")

class ExtractedData(BaseModel):
    hcpName: Optional[str] = None
    hcpSpecialty: Optional[str] = None
    detailingTopic: Optional[str] = None
    productsDiscussed: List[str] = []
    samplesDistributed: List[SampleItem] = []
    nextSteps: Optional[str] = None
    followUpDate: Optional[str] = None
    feedbackSentiment: Optional[str] = None
    complianceVerified: bool = False

class ChatRequest(BaseModel):
    message: str
    history: List[dict]
    currentData: ExtractedData
    activeNode: str

class ChatResponse(BaseModel):
    reply: str
    thought: str
    activeNode: str
    extractedData: ExtractedData

# 2. LLM Call Handler using Groq client
@app.post("/api/chat", response_model=ChatResponse)
async def process_chat_message(req: ChatRequest):
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured")
        
    client = groq.Groq(api_key=groq_api_key)
    
    # Construct structured system instructions
    system_prompt = f"""
    You are the core intelligence processor of an AI-first Healthcare Professional CRM.
    Analyze the user input, update the current structured data fields and determine the next active LangGraph node.
    You must output a valid JSON response adhering exactly to the ChatResponse schema.
    """
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.message}
            ],
            model="gemma2-9b-it", # Groq model identifier
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        
        # Parse and return validated json
        return ChatResponse.parse_raw(chat_completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")`,

    sql: `-- =====================================================================
-- PostgreSQL relational database schemas for HCP Life Sciences Module
-- =====================================================================

-- 1. Healthcare Professionals (HCP) Table
CREATE TABLE hcps (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CRM Detailing Interactions Table
CREATE TABLE interactions (
    id VARCHAR(50) PRIMARY KEY,
    hcp_id VARCHAR(50) REFERENCES hcps(id),
    hcp_name VARCHAR(150) NOT NULL,
    hcp_specialty VARCHAR(100) NOT NULL,
    interaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    detailing_topic TEXT NOT NULL,
    next_steps TEXT,
    follow_up_date DATE,
    feedback_sentiment VARCHAR(20) CHECK (feedback_sentiment IN ('Positive', 'Neutral', 'Critical', '')),
    compliance_verified BOOLEAN DEFAULT FALSE,
    logged_by_chat BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products Discussed Junction Table
CREATE TABLE interaction_products (
    id SERIAL PRIMARY KEY,
    interaction_id VARCHAR(50) REFERENCES interactions(id) ON DELETE CASCADE,
    product_name VARCHAR(100) NOT NULL
);

-- 4. Sample Distributions Log Table (PhRMA Compliance)
CREATE TABLE samples_logged (
    id SERIAL PRIMARY KEY,
    interaction_id VARCHAR(50) REFERENCES interactions(id) ON DELETE CASCADE,
    product_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    distributed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial High-Profile Doctors
INSERT INTO hcps (id, name, specialty, institution, email, phone) VALUES
('hcp-1', 'Dr. Sarah Jenkins', 'Cardiology', 'Mayo Clinic', 's.jenkins@mayoclinic.org', '555-0143'),
('hcp-2', 'Dr. Marcus Vance', 'Oncology', 'MD Anderson Cancer Center', 'mvance@mdanderson.org', '555-0198');`,

    redux: `// =====================================================================
// Redux Toolkit CRM Slice State Engine
// =====================================================================
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface CRMState {
  currentLog: InteractionData;
  activeLangGraphNode: 'GREETING' | 'DETAILING' | 'SAMPLES' | 'NEXT_STEPS' | 'COMPLETED';
  agentChatHistory: ChatMessage[];
  agentThoughts: AgentThought[];
}

export const sendChatToAgent = createAsyncThunk(
  "crm/sendChatToAgent",
  async (payload: ChatRequest) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await response.json();
  }
);

const crmSlice = createSlice({
  name: "crm",
  initialState,
  reducers: {
    updateCurrentLogField(state, action) {
      state.currentLog[action.payload.field] = action.payload.value;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(sendChatToAgent.fulfilled, (state, action) => {
      const { reply, thought, activeNode, extractedData } = action.payload;
      state.agentChatHistory.push({ sender: "agent", text: reply });
      state.activeLangGraphNode = activeNode;
      state.currentLog = { ...state.currentLog, ...extractedData };
      state.agentThoughts.push({ node: activeNode, thought });
    });
  }
});`
  };

  const getSubTabIcon = (tab: typeof activeSubTab) => {
    switch (tab) {
      case "langgraph": return Layers;
      case "tools": return Cpu;
      case "fastapi": return Server;
      case "sql": return Database;
      case "redux": return Code;
    }
  };

  const ActiveIcon = getSubTabIcon(activeSubTab);

  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl overflow-hidden shadow-xl p-6 h-[520px] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-4 gap-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-teal-400 uppercase">
            HCP Module Architecture Blueprint
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-grade source definitions across full CRM service stack
          </p>
        </div>

        {/* Copy Button */}
        <button
          onClick={() => copyCodeToClipboard(codeSnippets[activeSubTab])}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono border border-slate-700 cursor-pointer transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 mb-4 overflow-x-auto scrollbar-none">
        {(["langgraph", "tools", "fastapi", "sql", "redux"] as const).map((tab) => {
          const IconComponent = getSubTabIcon(tab);
          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0 ${
                activeSubTab === tab
                  ? "bg-teal-500/15 text-teal-400 border border-teal-500/20"
                  : "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
              <span className="capitalize">
                {tab === "sql" ? "Postgres SQL" : tab === "redux" ? "Redux Slice" : tab === "tools" ? "Agent Tools" : tab}
              </span>
            </button>
          );
        })}
      </div>

      {/* Code Display Area */}
      <div className="flex-1 bg-slate-950 p-4 rounded-xl border border-slate-850 overflow-y-auto font-mono text-xs leading-relaxed text-slate-300 scrollbar-thin">
        <pre className="whitespace-pre">{codeSnippets[activeSubTab]}</pre>
      </div>
    </div>
  );
}
