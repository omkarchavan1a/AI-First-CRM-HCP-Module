# Life-Sciences HCP Interaction Detailing CRM with AI Copilot

An advanced, responsive life-sciences CRM application designed for pharmaceutical representatives to seamlessly log and analyze interactions with Healthcare Professionals (HCPs). Combining **structured input forms** and a conversational **AI Assistant (Copilot)** in a sleek side-by-side layout, this platform captures high-fidelity interaction records and commits them to a local or cloud PostgreSQL database.

---

## 🎨 Layout & Design Theme

The frontend is crafted using **Tailwind CSS** following a modern, professional life-sciences design aesthetic:
* **Side-by-Side Interface**: Replicates the reference design precisely with a structured logging interface on the left and the AI Assistant on the right.
* **Neutral & High-Contrast Accents**: Pristine slate backgrounds, crisp card borders (`border-slate-200/80`), elegant typography, and a vivid blue brand color (`bg-blue-600`) for the action button and interface focal points.
* **Developer Console**: A collapsible drawer that keeps complex telemetry (Execution State Trace, Live SQL History Database, and LangGraph Architecture Blueprints) out of sight for a clean, user-facing experience, but fully accessible for developer debugging.

---

## 🚀 Key Features

### 1. Structured HCP Logging Form
* **HCP Name Search**: Simple, searchable doctor selection.
* **Detailed Record Fields**: Includes Date, Time, Attendees, and key topics discussed.
* **Intelligent Product Scanner**: Auto-scans text typed into "Topics Discussed" for mentioned therapeutic products (e.g., *Prodo-X, Lipitrol, CardiaGuard, Restorol*) and auto-populates the *Products Discussed* tag list.
* **Voice Detailing Summary**: Features simulated transcription that models real-world audio detailing capture.
* **Samples & Materials Shared**: A custom checklist module to search and add starter packs, complete with responsive removal.

### 2. Conversational AI Assistant (Copilot)
* **Real-time Detail Extraction**: Users can describe a natural conversation (e.g., *"Met Dr. Smith, discussed Prodo-X efficacy, positive sentiment, shared brochure"*), and the AI will automatically parse the unstructured text to pre-fill the corresponding fields in the structured form.
* **Built-in Quick Scenarios**: Instantly test typical pharma sales interactions via quick-action prescription scenarios.

### 3. Integrated Developer Console
* **Execution State Trace**: Follows variables, thought-trees, and extraction logs as they stream from the LangGraph processing node.
* **PostgreSQL Audit Log**: Live SQL database table visualization capturing committed interaction histories.
* **State Graph Visualizer**: Diagrams the architectural flow of routing, field validation, and state commit steps.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite, TypeScript, Tailwind CSS, Lucide icons)
* **Backend**: Express.js with Node custom server middleware
* **Database**: PostgreSQL (connected via robust server-side routing)
* **AI Engine**: Extractor utilizing `@google/genai` (powered by Gemini models) with fallback mock processors for offline local development.

---

## ⚙️ Getting Started

### Prerequisites
* Node.js (v18+)
* PostgreSQL Database (optional; falls back to an in-memory SQL mock layer if offline)
* Gemini API Key (optional; add as `GEMINI_API_KEY` in environment secrets)

### Installation & Development

1. Install all dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```
The application will boot up and be accessible locally at `http://localhost:3000`.

### Environment Variables
Configure the following keys in your `.env` file:
```env
# Google Gemini API key for smart conversational logs extraction
GEMINI_API_KEY=your_gemini_api_key_here

# Database credentials (if configuring external cloud database)
DATABASE_URL=your_postgres_database_url_here
```

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                      Web Client                        │
│  ┌─────────────────────────┐  ┌─────────────────────┐  │
│  │   Structured Form       │  │   AI Assistant      │  │
│  │   (Interactive Input)   │  │   (Chat Interface)  │  │
│  └────────────┬────────────┘  └──────────┬──────────┘  │
└───────────────┼──────────────────────────┼─────────────┘
                ▼                          ▼
┌────────────────────────────────────────────────────────┐
│                    Express.js Backend                  │
│  ┌─────────────────────────┐  ┌─────────────────────┐  │
│  │   API Routing Engine    │  │  AI Agent Extractor │  │
│  │   (/api/interactions)   │  │ (Gemini/LangGraph)  │  │
│  └────────────┬────────────┘  └──────────┬──────────┘  │
└───────────────┼──────────────────────────┼─────────────┘
                ▼                          ▼
┌────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                  │
└────────────────────────────────────────────────────────┘
```

The system splits raw text detailing processing through an AI agent workflow that classifies and formats parameters before returning them to form state variables. When committed, the compiled record is transmitted through standard JSON endpoints and persisted securely to the SQL database.
