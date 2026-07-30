# System Architecture & Technical Specifications

## Architectural Overview

The **AIVOA Customer Complaint Management System** is built using a modern decoupled full-stack architecture:

- **Frontend**: Single Page Application (SPA) built with React (Vite), Redux Toolkit for state management, and a custom CSS glassmorphism design system.
- **Backend**: High-performance RESTful API built with Python FastAPI, SQLAlchemy ORM, and Pydantic data validation.
- **AI Core**: LangGraph state graph pipeline integrated with Groq LLMs (`gemma2-9b-it` / `llama-3.3-70b-versatile`).

```
+-----------------------------------------------------------------------+
|                             REACT FRONTEND                            |
|  +-------------------+  +--------------------+  +------------------+  |
|  | Dashboard View    |  | Log Complaint Form |  | AI Copilot Drawer|  |
|  +-------------------+  +--------------------+  +------------------+  |
|                                | (Redux Store)                        |
+--------------------------------|--------------------------------------+
                                 | HTTP / Axios
+--------------------------------v--------------------------------------+
|                           FASTAPI BACKEND                             |
|  +--------------------+  +------------------+  +-------------------+  |
|  | /api/complaints    |  | /api/ai/extract  |  | /api/ai/analyze   |  |
|  +--------------------+  +------------------+  +-------------------+  |
|            |                      |                      |            |
|            v                      +----------+-----------+            |
|    SQLAlchemy ORM                            |                        |
|            |                                 v                        |
|    SQLite / Postgres                 LANGGRAPH AI ENGINE              |
|   (Pharma QMS Database)         (Extract -> Dup -> Risk -> CAPA)      |
|                                              |                        |
|                                              v                        |
|                                         GROQ API LLM                  |
+-----------------------------------------------------------------------+
```

---

## Database Schema Design (`backend/app/models.py`)

### 1. `complaints` Table
- `id` (Integer, Primary Key)
- `complaint_number` (String, Unique, e.g. `CMP-2026-0001`)
- `reporter_name`, `reporter_email`, `reporter_type`
- `product_name`, `product_type` (`API` or `FDF`)
- `batch_number`, `manufacturing_date`, `expiry_date`
- `complaint_type`, `severity` (`Low`, `Medium`, `High`, `Critical`)
- `raw_complaint_text`, `summary`
- `status` (`Logged`, `Under Investigation`, `CAPA Pending`, `Closed`)
- `risk_level` (`Class I`, `Class II`, `Class III`, `Pending`)
- `risk_score` (Float, 0.0 to 10.0)
- `completeness_score` (Float, 0.0% to 100.0%)
- `is_duplicate`, `duplicate_of_id`
- `created_at`, `updated_at`

### 2. `risk_assessments` Table
- `id` (Integer, Primary Key)
- `complaint_id` (ForeignKey to `complaints.id`)
- `health_hazard_level` (`Class I`, `Class II`, `Class III`)
- `patient_impact` (Text)
- `probable_root_cause` (Text)
- `investigation_steps` (JSON list of steps)
- `risk_justification` (Text)

### 3. `capa_recommendations` Table
- `id` (Integer, Primary Key)
- `complaint_id` (ForeignKey to `complaints.id`)
- `capa_type` (`Corrective Action` or `Preventive Action`)
- `description` (Text)
- `target_department` (`Quality Assurance`, `Production`, `Packaging`, `Supply Chain`)
- `priority` (`High`, `Medium`, `Low`)
- `status` (`Proposed`, `Approved`, `Implemented`, `Verified`)

### 4. `audit_logs` Table
- `id` (Integer, Primary Key)
- `complaint_id` (ForeignKey to `complaints.id`)
- `action` (String)
- `performed_by` (`AI Copilot Agent`, `Quality Manager`, `System User`)
- `details` (Text)
- `timestamp` (DateTime)

---

## API Specifications

### Complaints API (`/api/complaints`)
- `GET /api/complaints/`: Fetch all complaints with optional `status_filter` and `risk_filter`.
- `GET /api/complaints/{id}`: Fetch single complaint record with risk assessment and CAPAs.
- `POST /api/complaints/`: Create new complaint record.
- `PUT /api/complaints/{id}`: Update complaint status or severity.
- `POST /api/complaints/{id}/capas`: Attach a new CAPA action to a complaint.

### AI Engine API (`/api/ai`)
- `POST /api/ai/extract-text`: Perform AI extraction on raw complaint text and compute completeness score.
- `POST /api/ai/analyze-complaint`: Execute full LangGraph multi-node AI pipeline and save results to DB.
- `POST /api/ai/copilot-chat`: Interactive QMS Copilot Chat streaming.
