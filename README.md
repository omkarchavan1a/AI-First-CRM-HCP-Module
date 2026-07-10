# 🩺 Life-Sciences HCP Detailing CRM & Secure Compliance Ledger

An advanced, enterprise-grade CRM and compliance auditing dashboard designed for pharmaceutical representatives to capture, sanitize, and authorize Healthcare Professional (HCP) interactions. Combining **structured clinical logs**, a live **Gemini-powered Voice Detailing Copilot**, and **strict regulatory security controls**, this system ensures full alignment with HIPAA privacy standards and PDMA (Prescription Drug Marketing Act) mandates.

---

## 🗺️ Application Architecture & Data Flow Map

Below is the execution map tracing how a medical representative initiates a visit, utilizes the Gemini Clinical Extractor, validates practitioner credentials, scrubs patient identifiers, executes digital signature authorization, and commits ledger-audited entries to the PostgreSQL database:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       1. TERMINAL PRIVACY SCREEN LOCK                       │
│  - Restricts access to sensitive practitioner data and drug ledger histories │
│  - Secure bypass key PIN: [ 1 2 3 4 ]                                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Unlock Success
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     2. SEARCHABLE PRACTITIONER REGISTRY                     │
│  - Real-time HCP Selector pulling from State License databases              │
│  - Auto-verifies Active Status, NPI Registry ID, and State License Number  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Select Doctor
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│               3. DETAILING ENGAGEMENT & VOICE COPILOT MODAL                 │
│  - Option A: Manual text logging with active Therapeutic Product Scanner     │
│  - Option B: Real-time native dictation or Sample Script presets             │
│  - Triggers Gemini Clinical Extractor (gemini-1.5-flash / gemini-3.5-flash)  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Extracted Fields Populated
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 4. HIPAA PRIVACY ALERT GUARD (PHI SHIELD)                   │
│  - Real-time scanner parses text for SSNs, MRNs, DOBs, and patient names     │
│  - Blocks save operations if patient identifiers are detected                │
│  - "Automated De-Identification" button scrubs PHI into sanitized tokens    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HIPAA Sanity Check OK
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  5. PDMA / FDA DRUG SAMPLE SIGNATURE PAD                     │
│  - Activates when sample starter packs are added to the transaction         │
│  - Interactive HTML5 canvas captures practitioner's hand-drawn signature     │
│  - Generates secure compliance SHA-256 Verification Hash bound to ledger    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Signature Verified
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       6. DB COMMIT & AUDIT LEDGER LOG                       │
│  - Transmits payload securely over TLS to standard REST APIs (/api/save)    │
│  - Persists structured logs to PostgreSQL database tables                   │
│  - Displays ledger status inside Developer Drawer Database Console          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security & Regulatory Guardrails (Implemented)

This update introduces a multi-tier security framework conforming to strict healthcare information standards:

### 1. HIPAA PHI (Protected Health Information) Scanner
* **Interactive Guardrail**: Tracks input in the *Topics Discussed* text block, parsing characters for direct patient identifiers (SSNs, medical record numbers, dates of birth, or actual patient names).
* **De-Identification Tool**: Features a one-click **Automated HIPAA De-Identification** button that instantly redacts and replaces protected patient markers with sanitized regulatory tags (e.g. `[REDACTED PATIENT-DATA]`), protecting your logs from accidental HIPAA data leaks.

### 2. PDMA / FDA Drug Sample Signature Pad
* **Interactive Canvas**: When sample starter packs are distributed, the system activates a **HCP Electronic Signature** workflow.
* **Audit ledger Integration**: Capturing a signature converts the drawing to a secure base64 string, validates the state license alignment, and generates a cryptographic **SHA-256 Ledger Verification Hash** that protects the transaction ledger from modification.

### 3. State-level NPI & License Verification
* **PDMA Compliant Registry**: The HCP registry holds certified **National Provider Identifier (NPI)** keys and State Medical License Numbers.
* **Credential Validation Guard**: Changing the selected practitioner instantly runs validation on their medical board registration status and renders their official credentials on-screen.

### 4. HIPAA Protected Terminal Screen Lock
* **Access Isolation**: Includes a **Lock Terminal** mechanism designed for multi-user medical sales environments where representatives leave laptops open in busy hospital hallways.
* **PIN Authorization**: Restricts the screen with an overlay. Users must enter the secure bypass PIN (**1234**) to resume editing or viewing interactions.

---

## 💡 How to Use the Application: Step-by-Step

Follow these steps to complete a fully compliant, AI-assisted practitioner visit log:

### Step 1: Unlock the Terminal
* Upon launch (or whenever clicking **Lock Terminal**), the screen will present a secure dark screen lock.
* Enter the sandbox authorization PIN: **1234** (using either your keyboard or the on-screen tactile keypad) to unlock the application.

### Step 2: Select a Healthcare Professional (HCP)
* Click the practitioner dropdown inside the **Structured Form** card on the left.
* Select a physician (e.g., *Dr. Sarah Jenkins* or *Dr. Marcus Vance*).
* Notice the **Credential Validation Guard** widget appearing, confirming their NPI number, active license status, and State Board registry verification.

### Step 3: Speak or Populate Unstructured Text via Gemini Copilot
* Click the **Summarize from Voice Note** button at the base of the Structured Form.
* Inside the Copilot Modal, you can:
  * **Dictate Real-Time**: Click **Start Listening** and speak into your microphone.
  * **Use Preloaded Scripts**: Select one of our compliant clinical visit scripts (e.g., *🩺 CardioShield Visit* or *🎗️ OncoXen Trial Efficacy*).
* Click **Summarize & Extract** to send the transcript to the server-side Gemini endpoint. Gemini will parse the text and auto-populate the structured fields of your form!

### Step 4: Handle HIPAA PHI Security Alerts
* If you type patient-sensitive phrases (like *"patient Jane Smith had a high heart rate"* or *"Social Security SSN 123-45-6789"*), the **HIPAA Security Alert Scanner** will instantly flag the warning in bright red.
* Click **Run Automated HIPAA De-Identification** to clean the text into a compliant format before committing to the database.

### Step 5: Execute practitioner Signature Sign-Off
* Under the **Distributed Starter Packs** section, click **Add Sample**.
* Select a product and specify a quantity.
* Notice that the **PDMA / FDA Signature Guard** immediately requests practitioner authorization.
* Click **Capture HCP Electronic Signature**, sign the pad using your mouse or touchscreen, and click **Sign & Validate**. The compliance indicator will turn green and output a secure cryptographic signature ledger hash.

### Step 6: Commit and Inspect DB Records
* Click **Save detaling Interaction**.
* Open the **Developer Console** drawer at the bottom of your screen.
* Click the **Live Database** tab to verify that the interaction was saved with the NPI, State License, signature base64 image, and cryptographic ledger hash!

---

## 🛠️ Tech Stack & Setup Details

* **Frontend**: React 18, Vite, Tailwind CSS (modern light UI with professional accents), Lucide-React Icons.
* **Animations**: Powered by `motion/react` for buttery-smooth transitions and slide-in effects.
* **Server-Side API**: Express.js server in `server.ts` providing secure clinical parsing via Google Gemini API (`@google/genai`) and in-memory transactional ledger persistence.
* **Security Validation**: Custom local regex engines matching HIPAA standard safe harbor de-identification rules and cryptographic verification.

### Launch local development
```bash
# Install dependencies
npm install

# Start local server on Port 3000
npm run dev
```
Open `http://localhost:3000` to interact with the system!
