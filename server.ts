import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// In-Memory Database for Demo Persistence
const hcps = [
  { id: "hcp-1", name: "Dr. Sarah Jenkins", specialty: "Cardiology", institution: "Mayo Clinic", email: "s.jenkins@mayoclinic.org", phone: "555-0143" },
  { id: "hcp-2", name: "Dr. Marcus Vance", specialty: "Oncology", institution: "MD Anderson Cancer Center", email: "mvance@mdanderson.org", phone: "555-0198" },
  { id: "hcp-3", name: "Dr. Elena Rostova", specialty: "Pediatrics", institution: "Seattle Children's Hospital", email: "elena.rostova@seattlechildrens.org", phone: "555-0231" },
  { id: "hcp-4", name: "Dr. Amit Patel", specialty: "Endocrinology", institution: "Joslin Diabetes Center", email: "apatel@joslin.harvard.edu", phone: "555-0312" }
];

const mockInteractions = [
  {
    id: "int-1",
    hcpId: "hcp-1",
    hcpName: "Dr. Sarah Jenkins",
    hcpSpecialty: "Cardiology",
    date: "2026-07-01T14:30:00Z",
    detailingTopic: "Efficacy of CardioShield in patients with Stage 2 Hypertension.",
    productsDiscussed: ["CardioShield"],
    samplesDistributed: [{ product: "CardioShield 10mg Starter Pack", quantity: 5 }],
    nextSteps: "Follow up in 2 weeks to review clinical feedback and answer questions regarding safety profile.",
    followUpDate: "2026-07-15",
    feedbackSentiment: "Positive",
    complianceVerified: true,
    loggedByChat: false,
    timestamp: "2026-07-01T14:35:00Z"
  },
  {
    id: "int-2",
    hcpId: "hcp-2",
    hcpName: "Dr. Marcus Vance",
    hcpSpecialty: "Oncology",
    date: "2026-07-03T10:15:00Z",
    detailingTopic: "OncoXen clinical trial data on progression-free survival in metastatic patients.",
    productsDiscussed: ["OncoXen"],
    samplesDistributed: [],
    nextSteps: "Provide research paper on progression-free survival statistics vs. chemotherapy.",
    followUpDate: "2026-07-10",
    feedbackSentiment: "Neutral",
    complianceVerified: true,
    loggedByChat: true,
    timestamp: "2026-07-03T10:22:00Z"
  }
];

// Endpoint: Get list of HCPs
app.get("/api/hcps", (req, res) => {
  res.json(hcps);
});

// Endpoint: Get interaction log history
app.get("/api/interactions", (req, res) => {
  res.json(mockInteractions);
});

// Endpoint: Save a newly logged interaction
app.post("/api/interactions", (req, res) => {
  const newInteraction = {
    id: `int-${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...req.body
  };
  mockInteractions.unshift(newInteraction);
  res.status(201).json(newInteraction);
});

// Endpoint: Run Conversational LLM with state tracking (simulating LangGraph agent)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, currentData, activeNode } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured. Please add it in the Secrets panel."
      });
    }

    const historyPrompt = history.map((h: any) => `${h.sender === "user" ? "Rep" : "Agent"}: ${h.text}`).join("\n");

    const systemInstruction = `You are the backend AI agent in a high-compliance life sciences CRM system for Healthcare Professional (HCP) field interactions.
Your job is to act as the conversational node processor of a LangGraph State Machine.
You guide a pharmaceutical field representative through logging an interaction they just completed with an HCP.

The LangGraph State Machine consists of these nodes:
1. 'GREETING': Welcoming the rep, identifying which HCP they met, or confirming the HCP details.
2. 'DETAILING': Discussing the scientific details, therapeutic drugs discussed, key clinical messages, and the HCP's response/feedback.
3. 'SAMPLES': Discussing drug samples, promotional materials, or starter packs distributed, along with quantities and compliance verification.
4. 'NEXT_STEPS': Discussing any follow-up scheduling, clinical papers requested, or follow-up dates.
5. 'COMPLETED': Interaction logs are full and ready for final verification and compliance signature.

Based on the conversation history and the latest message, you must:
1. Update the structured interaction data ('extractedData').
2. Transition the active node ('activeNode') based on what information has been successfully gathered.
   - Transition Rules:
     - Transition from GREETING to DETAILING once you know which HCP or specialty is being discussed.
     - Transition from DETAILING to SAMPLES when detailing topic or products discussed are described.
     - Transition from SAMPLES to NEXT_STEPS once sample distributions are gathered or bypassed.
     - Transition from NEXT_STEPS to COMPLETED once next steps and follow-up dates are established.
     - Note: If the rep explicitly provides details out of order (e.g., 'Met Dr. Jenkins, discussed CardioShield, left 2 samples, will follow up next Tuesday'), process everything and transition straight to COMPLETED or NEXT_STEPS!
3. Provide a natural, professional life-science agent reply. If some fields are missing, kindly ask the rep for them in a conversational way. Be very helpful.
4. Provide a 'thought' explaining the state-machine edge routing decision (e.g., 'Moving from SAMPLES to NEXT_STEPS because samples are logged and compliance check is true.').

Current Structured Data to update:
${JSON.stringify(currentData, null, 2)}

Current Active LangGraph Node:
${activeNode}

Response JSON MUST conform exactly to the responseSchema provided. Do not include any extra wrapper fields outside the schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: systemInstruction },
        { text: `Conversation history:\n${historyPrompt}\n\nLatest Rep message:\n"${message}"` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "The natural language response to the pharmaceutical field rep."
            },
            thought: {
              type: Type.STRING,
              description: "The agent's conceptual reasoning about state node transition in LangGraph."
            },
            activeNode: {
              type: Type.STRING,
              description: "The next active LangGraph node: 'GREETING', 'DETAILING', 'SAMPLES', 'NEXT_STEPS', or 'COMPLETED'."
            },
            extractedData: {
              type: Type.OBJECT,
              description: "The updated cumulative structured CRM interaction data.",
              properties: {
                hcpName: { type: Type.STRING },
                hcpSpecialty: { type: Type.STRING },
                interactionType: { type: Type.STRING, description: "e.g., 'Meeting', 'Phone Call', 'Email', 'Video Conference'" },
                date: { type: Type.STRING, description: "e.g., 'YYYY-MM-DD'" },
                time: { type: Type.STRING, description: "e.g., '07:36 PM' or standard time" },
                attendees: { type: Type.STRING, description: "List of other attendees present" },
                detailingTopic: { type: Type.STRING },
                productsDiscussed: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                samplesDistributed: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      product: { type: Type.STRING },
                      quantity: { type: Type.NUMBER }
                    },
                    required: ["product", "quantity"]
                  }
                },
                materialsShared: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                nextSteps: { type: Type.STRING },
                followUpDate: { type: Type.STRING },
                feedbackSentiment: { type: Type.STRING, description: "Must be: 'Positive', 'Neutral', 'Critical', or empty string" },
                complianceVerified: { type: Type.BOOLEAN }
              }
            }
          },
          required: ["reply", "thought", "activeNode", "extractedData"]
        }
      }
    });

    const parsedResult = JSON.parse(response.text || "{}");
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: error.message || "An error occurred while calling Gemini" });
  }
});

// Setup Vite Dev Server / Static Hosting
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
