# VitaMind AI – Personal Health & Wellness Copilot

> *"Your health has a story. Let's understand it."*

VitaMind AI is a full-stack, production-quality personal health copilot designed with a modern health-tech startup aesthetic. It unifies daily biometric tracking, longitudinal trend analytics, evidence-backed medical literature, and a conversational AI copilot that synthesizes your personal health data without ever overstepping clinical boundaries.

---

## ⚡ Core Philosophy & Clinical Safety Directives

VitaMind AI is built strictly according to medical AI safety guidelines:
- **No Diagnostic Claims:** VitaMind AI never diagnoses diseases or tells users they have an illness. It provides educational observations (e.g., *"Your recent sleep duration is slightly lower than your previous baseline"*).
- **No Prescriptions or Dosages:** The system never prescribes medicines, advises initiating prescription tablets, or determines dosage. It presents verified pharmacology monographs from FDA/NHS and recommends consulting licensed physicians or pharmacists.
- **Emergency Detection & Triage:** If emergency symptoms (chest pressure, severe difficulty breathing, stroke symptoms, uncontrolled bleeding) are detected, an immediate **URGENT CARE NOTICE** is rendered directing users to regional emergency services (911 / 112 / 999).
- **Privacy-First Isolation:** All health records and conversation histories are protected by bcrypt-hashed credentials and scoped strictly to the authenticated user's ID.

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 19 + Vite
- **Routing:** React Router v7
- **Data Visualization:** Recharts (Area charts, Bar charts, Line charts with dark glassmorphism tooltips)
- **Icons:** Lucide React
- **Styling:** Modern Vanilla CSS Design System (Custom properties, HSL tokens, glassmorphism, glowing pulse orbits)
- **Typography:** *Plus Jakarta Sans*, *Inter*, and *Outfit*

### Backend
- **Framework:** Python 3.12 + FastAPI
- **Data Validation:** Pydantic v2
- **ORM & Database:** SQLAlchemy 2.0 with PostgreSQL support & seamless SQLite fallback
- **Authentication:** JWT (JSON Web Tokens) with HS256 & Bcrypt password hashing
- **HTTP Client:** HTTPX (async requests for medical literature & LLM providers)

### Modular AI Engine
- **`MockAIProvider`:** Context-aware, intelligent health copilot fallback that analyzes the user's specific biometric numbers, goals, and allergies to produce structured educational responses without needing external API keys.
- **`FreeAIProvider`:** Google Gemini API integration (`gemini-1.5-flash`).
- **`ExternalAIProvider`:** OpenAI / Anthropic compatible endpoint.
- **`SafetyFilter`:** Intercepts and rewrites any unauthorized diagnoses or prescription statements.
- **`MedicalSearch`:** Search service anchored in official WHO, CDC, FDA, NHS, and MedlinePlus sources.

---

## 📱 Application Architecture & Features

```
User (Browser)
    │
    ▼
React 19 Frontend (Vite)
    │
    ▼  (REST API with JWT Bearer Token)
FastAPI Backend (Port 8000)
    │
    ├── Authentication & Users Router (/api/auth, /api/users)
    ├── Health Data & Metrics Router (/api/health)
    │     └── Calculates Wellness Score (0–100) & Computes Patterns
    ├── AI Copilot Router (/api/copilot)
    │     ├── 1. Retrieves user biometrics & profile
    │     ├── 2. Searches approved medical sources (WHO, CDC, FDA, NHS)
    │     ├── 3. Invokes Modular AI Engine (Gemini / External / Mock)
    │     ├── 4. Audits response via SafetyFilter (Rewrites unsafe statements)
    │     └── 5. Returns structured educational response & persists chat
    ├── Medications Router (/api/medications)
    │     └── Verified monographs, side effects, precautions & user tracking
    ├── Symptoms Router (/api/symptoms)
    │     └── Educational possibilities, self-care, and red-flag alerts
    └── Medical Search Router (/api/search/medical)
          └── Authoritative evidence search with trust scores
```

### Pages Included:
1. **Landing Page (`/`):** Central animated pulse orbit, live metrics preview, trust indicators, feature highlights, and medical disclaimer.
2. **Dashboard (`/dashboard`):** Holistic Wellness Score (0–100), 7 primary vital cards, 6 interactive Recharts (Sleep, Steps, Heart Rate, Weight, Exercise, Stress), AI insight cards, and one-click demo data seeding.
3. **Health Data (`/health`):** Comprehensive CRUD logging (Sleep, Steps, Heart Rate, Water, Exercise, Stress, Weight, Notes) with clean modals—never using `alert()`.
4. **Health Analysis (`/health-analysis`):** Multi-factor correlation breakdown (Sleep consistency, activity rhythm, hydration, autonomic stress recovery).
5. **AI Copilot (`/copilot`):** Conversational AI copilot interface with quick suggested questions, contextual memory, and structured response layout:
   - `SUMMARY`
   - `WHAT YOUR DATA SHOWS`
   - `GENERAL INFORMATION`
   - `POSSIBLE NEXT STEPS`
   - `WHEN TO SEEK PROFESSIONAL HELP`
   - `SOURCES`
6. **Medications (`/medications`):** Clinical database search, expandable safety monographs, interactive pharmacology questions, and personal tracked medications list.
7. **Symptoms (`/symptoms`):** Interactive symptom selector, severity/duration slider, red-flag emergency check, and evaluation history.
8. **User Profile (`/profile`):** Management of biometrics, primary wellness goals, allergies, and active medications.
9. **Authentication (`/login`, `/register`):** Secure login, registration with biometric profile setup, instant demo account access, and Google sign-in support.

---

## 🚀 Quickstart & Installation

### 1. Backend Setup

```bash
cd vitamind-ai/backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will automatically initialize all relational database tables and seed verified medications into the database.
API docs will be available at: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd vitamind-ai/frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## ⚙️ Environment Variables

Create `.env` in `vitamind-ai/backend/`:

```env
# Database: PostgreSQL URL or local fallback SQLite
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vitamind_db

# Security & JWT
SECRET_KEY=vitamind_ai_super_secret_jwt_key_2026_change_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Live AI LLM Model Configuration
# Supported providers: 'openai', 'gemini', 'groq', 'ollama'
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
AI_TEMPERATURE=0.7

# 1. OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY=your_openai_api_key_here

# 2. Google Gemini (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# 3. Groq (https://console.groq.com/keys)
GROQ_API_KEY=your_groq_api_key_here

# 4. Local Ollama or Custom OpenAI-Compatible (Optional)
# AI_ENDPOINT_URL=http://localhost:11434/v1/chat/completions


# Optional Google OAuth & Medical Search
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here

# Allowed CORS Origins
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

*Note: If PostgreSQL is not running locally, the application automatically falls back to local SQLite (`sqlite:///./vitamind.db`) without crashing, guaranteeing smooth hackathon demonstrations.*

---

## 🧪 Demo Mode

If no AI API key or PostgreSQL server is configured:
1. VitaMind AI activates `MockAIProvider` seamlessly.
2. Clicking **"Instant Demo Account Access"** on the login page logs into a pre-configured account (`demo.wellness@vitamind.ai`).
3. If no records are present, realistic 14-day sample records are displayed with a clear **DEMO DATA** badge.
4. Users can click **"Save Demo Data to Account"** to permanently populate the database with realistic logs.

---

## 🔒 Security & Privacy

- Bcrypt salt rounds: 12
- JWT session expiration: 24 hours
- Foreign key constraints with `ON DELETE CASCADE`
- Cross-user data isolation enforced on every SQL query
- Zero plaintext password storage

---

## 📄 License
Educational Open-Source License &copy; 2026 VitaMind AI.

