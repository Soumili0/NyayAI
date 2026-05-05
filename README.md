# 🧠 NyayAI — Tender Evaluation Platform

An AI-enabled system for **automated, explainable tender evaluation**, designed to assist procurement officers in analyzing bidder documents against tender criteria with full transparency and auditability.

---
## 🛠️ Tech Stack & Justification

### Frontend

* **React + Vite**

  * Fast and modern UI
  * Smooth document upload & dashboard experience

### Backend

* **Flask (Python)**

  * Lightweight and flexible API layer
  * Easy integration with AI/NLP tools

### Document Processing

* **PyMuPDF** → Fast PDF text extraction
* **python-docx** → Word document parsing
* **pytesseract** → OCR for scanned files

### Core Modules

* **Criteria Extraction:** Regex + rule-based logic
* **Evaluation Engine:** Rule-based matching + confidence scoring
* **Explainability Layer:** Evidence-backed decisions
* **Ambiguity Handler:** Flags uncertain cases for manual review
* **Audit Trail:** Full logging for transparency
* **Reporting:** PDF & CSV export

---
## ⚙️ Local Setup

### 🔹 Backend

```powershell
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs at:
👉 http://localhost:5000

---

### 🔹 Frontend

```powershell
cd frontendReactPart
npm install
npm run dev
```

Frontend runs at:
👉 http://localhost:5173

---

## 🧠 Architecture Workflow

The system follows a structured pipeline to ensure accurate, explainable tender evaluation:

1. **Document Upload**

   * Procurement officer uploads tender and bidder documents via frontend.

2. **Frontend Layer (React)**

   * Handles file upload, UI interaction, dashboard, and review interface.

3. **Backend API (Flask)**

   * Receives files and orchestrates processing and evaluation.

4. **Document Processing**

   * Supports:

     * PDF (PyMuPDF)
     * DOCX (python-docx)
     * Images (OCR via pytesseract)

5. **Text Extraction**

   * Extracts raw text from all uploaded documents.

6. **Criteria Extraction**

   * Identifies key requirements:

     * Financial criteria
     * Experience requirements
     * Certifications
     * Compliance rules

7. **Evaluation Engine**

   * Matches bidder data with extracted criteria.
   * Generates:

     * Pass/Fail decisions
     * Confidence scores

8. **Explainability Layer**

   * Provides:

     * Exact document source
     * Extracted value
     * Reason for decision

9. **Ambiguity Handling**

   * Flags uncertain cases for manual review instead of auto-rejection.

10. **Audit Logging**

* Tracks:

  * Evaluations
  * Manual overrides
  * User actions

11. **Report Generation**

* Generates:

  * PDF reports
  * CSV exports

12. **Frontend Display**

* Shows:

  * Results dashboard
  * Manual review panel
  * Audit logs
  * Evidence comparison

---

## ⚙️ How to Run the Project

Follow these steps to run the project locally:

### 🔹 Step 1: Clone Repository
graph TD

A[Procurement Officer] -->|Uploads Tender & Bids| B[Frontend (React + Vite)]

B -->|API Requests| C[Backend (Flask API)]

C --> D[Document Processing Layer]

D --> E[Text Extraction]
E -->|PDF| E1[PyMuPDF]
E -->|DOCX| E2[python-docx]
E -->|Images| E3[OCR - pytesseract]

D --> F[Criteria Extraction Engine]
F -->|Regex + Rules| F1[Financial, Experience, Compliance]

C --> G[Evaluation Engine]
G -->|Match Criteria vs Bidder Data| G1[Scoring + Decision]

G --> H[Explainability Layer]
H -->|Evidence + Reason| H1[Document Snippets]

G --> I[Ambiguity Handler]
I -->|Low Confidence| I1[Manual Review Required]

G --> J[Audit Log System]
J -->|Store Actions| J1[DB / JSON]

C --> K[Report Generator]
K -->|PDF / CSV| K1[Downloadable Reports]

B --> L[Dashboard & UI]
L -->|View Results| L1[Charts + Summary]

L -->|Manual Override| C

J --> L
K --> L
```


## ▶️ How the System Works (Quick Flow)

1. Upload tender + bidder documents
2. System extracts text
3. Criteria are identified
4. Bidders are evaluated
5. Ambiguous cases flagged
6. Results shown with explanation
7. Manual review (if needed)
8. Export reports
