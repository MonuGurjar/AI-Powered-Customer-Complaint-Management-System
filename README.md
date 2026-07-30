# AIVOA – AI-Powered Customer Complaint Management System (Pharma QMS)

A production-ready **Quality Management System (QMS) Customer Complaint Module** for pharmaceutical manufacturing companies handling **API** (Active Pharmaceutical Ingredient) and **FDF** (Finished Dosage Form) complaint workflows.

Built as specified for the AIVOA AI Product Engineer assignment using **React (Redux Toolkit)**, **FastAPI**, **LangGraph**, and **Groq LLM**.

---

## 📚 Complete Documentation Index

For detailed architectural and deployment insights, refer to the following documentation files:

- 🤖 [**`AI_USAGE.md`**](file:///home/silent-sovereign/Internship/AIVOA/AI_USAGE.md): Complete breakdown of AI agent architecture, **LangGraph** multi-node state graph, Groq LLM integration (`gemma2-9b-it` & `llama-3.3-70b-versatile`), and prompt design.
- 🏗️ [**`ARCHITECTURE.md`**](file:///home/silent-sovereign/Internship/AIVOA/ARCHITECTURE.md): System architecture diagrams, Database schema specifications (`Complaint`, `RiskAssessment`, `CAPARecommendation`, `AuditLog`), and REST API endpoints.
- 🚀 [**`DEPLOYMENT_VERCEL.md`**](file:///home/silent-sovereign/Internship/AIVOA/DEPLOYMENT_VERCEL.md): Step-by-step guide for deploying the application on **Vercel** and Render/Railway.

---

## Key Features

1. **AI Complaint Intake & Extraction Node**
   - Parses raw unstructured complaint texts, emails, or PDF reports.
   - Auto-populates structured form fields (Reporter Name, Product Name, API vs FDF type, Batch/Lot Number, Expiry Date, Complaint Category).
   - Computes **Complaint Completeness Score** ($0.0 - 100.0\%$) and identifies missing mandatory fields.

2. **LangGraph Multi-Node AI Pipeline**
   - `Extraction Node`: Structural entity parsing.
   - `Duplicate Detection Node`: Identifies potential duplicate complaints based on batch and defect patterns.
   - `Risk & Root Cause Node`: Evaluates ICH Q9 / FDA Health Hazard classification (Class I, Class II, Class III) and predicts probable root causes (e.g., blister sealing temperature drops, crystallization thermal degradation).
   - `CAPA Recommendation Node`: Generates actionable Corrective and Preventive Action plans assigned to Quality Assurance, Production, and Supply Chain teams.

3. **Interactive AI Copilot Drawer**
   - Real-time side drawer displaying risk hazard badges, patient impact analysis, and proposed CAPAs.
   - Interactive QMS chat assistant to draft RCA 5-Whys, investigation protocols, and audit logs.

4. **1-Click Sample Complaint Loader**
   - Presets for testing FDF blister packaging defects, API raw material impurities, and cold-chain temperature excursions.

---

## Tech Stack

- **Frontend**: React (Vite) + Redux Toolkit + Lucide Icons + Custom HSL Glassmorphism Design System (Font: Google Inter).
- **Backend**: Python 3.10+ + FastAPI + SQLAlchemy ORM + Pydantic.
- **AI Engine**: LangGraph + Groq API (`gemma2-9b-it` / `llama-3.3-70b-versatile`) with intelligent mock fallback engine when API key is pending.
- **Database**: SQLite (SQLAlchemy ORM) out of the box, zero configuration required.

---

## Project Structure

```
AIVOA/
├── backend/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── graph.py         # LangGraph StateGraph workflow definition
│   │   │   ├── groq_client.py   # Groq LLM API wrapper with fallback engine
│   │   │   ├── nodes.py         # Multi-node AI pipeline nodes
│   │   │   └── prompts.py       # QMS ICH Q9 & FDA compliant prompts
│   │   ├── routers/
│   │   │   ├── ai_router.py     # FastAPI AI extraction & Copilot chat endpoints
│   │   │   └── complaint_router.py # REST endpoints for complaint CRUD
│   │   ├── config.py            # Environment configuration
│   │   ├── database.py          # SQLAlchemy database setup
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── models.py            # DB Schema (Complaint, RiskAssessment, CAPA, AuditLog)
│   │   ├── schemas.py           # Pydantic validation schemas
│   │   └── seed_data.py         # Realistic pharma complaints database seeder
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AICopilotDrawer.jsx   # AI Copilot & Risk Drawer
│   │   │   ├── ComplaintDashboard.jsx# Metrics cards & complaints table
│   │   │   ├── Header.jsx            # Top navbar
│   │   │   ├── LogComplaintForm.jsx  # AI auto-fill intake form
│   │   │   ├── SampleDataPicker.jsx  # 1-click pharma complaint sample loader
│   │   │   └── Sidebar.jsx           # QMS navigation
│   │   ├── services/
│   │   │   └── api.js                # Axios API client
│   │   ├── store/
│   │   │   ├── aiSlice.js            # Redux slice for AI extraction & chat
│   │   │   ├── complaintSlice.js     # Redux slice for complaint data
│   │   │   └── store.js              # Redux store config
│   │   ├── App.jsx
│   │   ├── index.css                 # Inter font & Glassmorphism theme
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vercel.json               # Vercel SPA rewrites configuration
│   └── vite.config.js
│
├── vercel.json                   # Root Vercel project configuration
├── AI_USAGE.md                   # AI & LangGraph documentation
├── ARCHITECTURE.md               # Architecture & DB schema documentation
├── DEPLOYMENT_VERCEL.md          # Vercel deployment guide
└── README.md
```

---

## Quick Start Guide

### 1. Backend Setup & Running

```bash
cd backend

# Create virtual environment (optional)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed initial realistic pharma complaint database
python -m app.seed_data

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Docs will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

#### Setting your Groq API Key
Add your Groq API Key to a `.env` file inside `backend/`:
```env
GROQ_API_KEY=your_groq_api_token_here
```
*(Note: If `GROQ_API_KEY` is not set, the application automatically uses the built-in QMS rules engine for seamless demonstration).*

### 2. Frontend Setup & Running

```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite React development server
npm run dev
```
- Web Application will run at: [http://localhost:3000](http://localhost:3000)

---

