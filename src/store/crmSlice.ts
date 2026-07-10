import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CRMState, HCP, Interaction, InteractionData, ChatMessage, SampleDistributed } from "../types";

const initialCurrentLog: InteractionData = {
  hcpName: "",
  hcpSpecialty: "",
  interactionType: "Meeting",
  date: "04/19/2025",
  time: "07:36 PM",
  attendees: "",
  detailingTopic: "",
  productsDiscussed: [],
  samplesDistributed: [],
  materialsShared: [],
  nextSteps: "",
  followUpDate: "",
  feedbackSentiment: "",
  complianceVerified: false
};

const initialState: CRMState = {
  hcps: [],
  interactions: [],
  loadingHcps: false,
  loadingInteractions: false,
  activeTab: "chat",
  currentLog: initialCurrentLog,
  activeLangGraphNode: "GREETING",
  agentChatHistory: [
    {
      id: "init-1",
      sender: "agent",
      text: "Hello! I am your AI Detailing Assistant. Let's log your recent healthcare professional interaction. Which doctor or healthcare professional did you visit, and what did you discuss?",
      timestamp: new Date().toISOString(),
      activeNode: "GREETING"
    }
  ],
  agentLoading: false,
  agentThoughts: [
    {
      node: "START",
      thought: "Initialized LangGraph state machine. Current state node: GREETING. Waiting for field representative input to identify the HCP.",
      timestamp: new Date().toISOString()
    }
  ],
  error: null
};

// Async Thunk: Fetch HCPs
export const fetchHcps = createAsyncThunk("crm/fetchHcps", async () => {
  const response = await fetch("/api/hcps");
  if (!response.ok) throw new Error("Failed to fetch healthcare professionals");
  return (await response.json()) as HCP[];
});

// Async Thunk: Fetch Interactions
export const fetchInteractions = createAsyncThunk("crm/fetchInteractions", async () => {
  const response = await fetch("/api/interactions");
  if (!response.ok) throw new Error("Failed to fetch interaction logs");
  return (await response.json()) as Interaction[];
});

// Async Thunk: Save Interaction
export const saveInteraction = createAsyncThunk(
  "crm/saveInteraction",
  async (payload: { data: InteractionData; loggedByChat: boolean }) => {
    const response = await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload.data,
        loggedByChat: payload.loggedByChat,
        date: payload.data.date || new Date().toISOString().split("T")[0],
        timestamp: new Date().toISOString()
      })
    });
    if (!response.ok) throw new Error("Failed to save interaction");
    return (await response.json()) as Interaction;
  }
);

// Async Thunk: Send Chat to Agent (Simulating LangGraph execution)
export const sendChatToAgent = createAsyncThunk(
  "crm/sendChatToAgent",
  async (
    payload: { message: string; history: ChatMessage[]; currentData: InteractionData; activeNode: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to communicate with AI Agent");
      }
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message || "An error occurred");
    }
  }
);

const crmSlice = createSlice({
  name: "crm",
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<"chat" | "form">) {
      state.activeTab = action.payload;
    },
    updateCurrentLogField<K extends keyof InteractionData>(
      state: CRMState,
      action: PayloadAction<{ field: K; value: InteractionData[K] }>
    ) {
      state.currentLog[action.payload.field] = action.payload.value;
      
      // Auto-update specialty if HCP name matches an existing HCP
      if (action.payload.field === "hcpName") {
        const found = state.hcps.find(
          (h) => h.name.toLowerCase() === (action.payload.value as string).toLowerCase()
        );
        if (found) {
          state.currentLog.hcpSpecialty = found.specialty;
          state.currentLog.hcpNpi = found.npi;
          state.currentLog.hcpLicense = found.licenseNumber;
        }
      }
    },
    updateCurrentLogBulk(state, action: PayloadAction<Partial<InteractionData>>) {
      state.currentLog = {
        ...state.currentLog,
        ...action.payload
      };
      
      // Auto-update specialty if HCP name is changed
      if (action.payload.hcpName) {
        const found = state.hcps.find(
          (h) => h.name.toLowerCase() === action.payload.hcpName!.toLowerCase()
        );
        if (found) {
          state.currentLog.hcpSpecialty = found.specialty;
          state.currentLog.hcpNpi = found.npi;
          state.currentLog.hcpLicense = found.licenseNumber;
        }
      }
    },
    resetCurrentLog(state) {
      state.currentLog = { ...initialCurrentLog };
      state.activeLangGraphNode = "GREETING";
      state.agentChatHistory = [
        {
          id: `init-${Date.now()}`,
          sender: "agent",
          text: "Let's log a new interaction. Tell me who you met with and what products were detailed.",
          timestamp: new Date().toISOString(),
          activeNode: "GREETING"
        }
      ];
      state.agentThoughts = [
        {
          node: "START",
          thought: "Reset LangGraph state. Active node: GREETING. Awaiting representative input.",
          timestamp: new Date().toISOString()
        }
      ];
    },
    setLangGraphNode(state, action: PayloadAction<'GREETING' | 'DETAILING' | 'SAMPLES' | 'NEXT_STEPS' | 'COMPLETED'>) {
      state.activeLangGraphNode = action.payload;
    },
    addManualChatMessage(state, action: PayloadAction<ChatMessage>) {
      state.agentChatHistory.push(action.payload);
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch HCPs
    builder.addCase(fetchHcps.pending, (state) => {
      state.loadingHcps = true;
    });
    builder.addCase(fetchHcps.fulfilled, (state, action) => {
      state.loadingHcps = false;
      state.hcps = action.payload;
    });
    builder.addCase(fetchHcps.rejected, (state, action) => {
      state.loadingHcps = false;
      state.error = action.error.message || "Failed to load HCPs";
    });

    // Fetch Interactions
    builder.addCase(fetchInteractions.pending, (state) => {
      state.loadingInteractions = true;
    });
    builder.addCase(fetchInteractions.fulfilled, (state, action) => {
      state.loadingInteractions = false;
      state.interactions = action.payload;
    });
    builder.addCase(fetchInteractions.rejected, (state, action) => {
      state.loadingInteractions = false;
      state.error = action.error.message || "Failed to load interactions";
    });

    // Save Interaction
    builder.addCase(saveInteraction.fulfilled, (state, action) => {
      state.interactions.unshift(action.payload);
      state.currentLog = { ...initialCurrentLog };
      state.activeLangGraphNode = "GREETING";
      state.agentChatHistory = [
        {
          id: `init-${Date.now()}`,
          sender: "agent",
          text: "Previous interaction successfully committed to SQL database. Ready to log your next healthcare professional visit!",
          timestamp: new Date().toISOString(),
          activeNode: "GREETING"
        }
      ];
      state.agentThoughts = [
        {
          node: "SQL_COMMIT",
          thought: "Interaction committed to database. State machine reset to GREETING.",
          timestamp: new Date().toISOString()
        }
      ];
    });

    // Chat Agent LLM request
    builder.addCase(sendChatToAgent.pending, (state) => {
      state.agentLoading = true;
      state.error = null;
    });
    builder.addCase(sendChatToAgent.fulfilled, (state, action) => {
      state.agentLoading = false;
      const { reply, thought, activeNode, extractedData } = action.payload;

      // Add agent reply to chat history
      state.agentChatHistory.push({
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: reply,
        timestamp: new Date().toISOString(),
        activeNode,
        thought
      });

      // Update active LangGraph Node
      if (activeNode) {
        state.activeLangGraphNode = activeNode;
      }

      // Update structured values extracted by LLM
      if (extractedData) {
        state.currentLog = {
          ...state.currentLog,
          ...extractedData
        };
      }

      // Add thought log
      state.agentThoughts.push({
        node: activeNode || state.activeLangGraphNode,
        thought: thought || "Updated state fields based on conversational extraction.",
        timestamp: new Date().toISOString()
      });
    });
    builder.addCase(sendChatToAgent.rejected, (state, action) => {
      state.agentLoading = false;
      state.error = (action.payload as string) || "Failed to call conversational service";
    });
  }
});

export const {
  setActiveTab,
  updateCurrentLogField,
  updateCurrentLogBulk,
  resetCurrentLog,
  setLangGraphNode,
  addManualChatMessage,
  clearError
} = crmSlice.actions;

export default crmSlice.reducer;
