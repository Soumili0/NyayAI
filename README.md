# 🧠 NyayAI — Tender Evaluation Platform

An AI-enabled system for **automated, explainable tender evaluation**, designed to assist procurement officers in analyzing bidder documents against tender criteria with full transparency and auditability.

---

## 🚀 Architecture Overview

### System Flow

```mermaid
graph TD
A[Procurement Officer uploads Tender & Bids] --> B[Frontend (React)]
B --> C[Backend API (Flask)]
C --> D[Document Processing & Extraction]
D -->|PDF, DOCX, Image, OCR| E[Text Extraction]
D --> F[Criteria Extraction]
C --> G[Bidder Evaluation Engine]
G --> H[Explainability Layer]
G --> I[Ambiguity Handler]
G --> J[Audit Log]
C --> K[PDF/CSV Report Generator]
B --> L[Results & Review UI]
L -->|Manual Override| C
J --> L
K --> L
```

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

## 📂 Project Structure

```
NyayAI/
│
├── backend/                # Flask API
├── frontendReactPart/      # React + Vite frontend
├── ScreenShort_of_the_project/
└── run-all.ps1
```

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

## ▶️ Quick Start (One Command)

```powershell
.\run-all.ps1
```

---

## 🧪 Usage

1. Upload Tender Document
2. Upload Bidder Documents
3. Click **Run Evaluation**
4. Review results and flagged ambiguities
5. Perform manual override if needed
6. Export report (PDF/CSV)

---

## ✨ Features

### 📊 Frontend

* Document upload UI
* Criteria extraction editor
* Evaluation dashboard with charts
* Manual review interface
* History + search + filters
* Bulk operations (delete/download)
* Evidence viewer (side-by-side comparison)
* Audit log viewer

### ⚙️ Backend

* Real document text extraction (PDF/DOCX/Image)
* Criteria parsing from tender
* Rule-based evaluation engine
* Confidence scoring & ambiguity detection
* Full audit trail logging
* Evaluation history storage
* PDF report generation
* Document classification (Tender vs Bid)

---

## 📸 Project Screenshots

<p align="center">
  <img src="ScreenShort_of_the_project/dashboard.jpeg" width="700"/>
  <br><b>Dashboard</b>
</p>

<p align="center">
  <img src="ScreenShort_of_the_project/upload.jpeg" width="700"/>
  <br><b>Upload Interface</b>
</p>

<p align="center">
  <img src="ScreenShort_of_the_project/criteria.jpeg" width="700"/>
  <br><b>Criteria Extraction</b>
</p>

<p align="center">
  <img src="ScreenShort_of_the_project/result1.jpeg" width="700"/>
  <br><b>Evaluation Result</b>
</p>

<p align="center">
  <img src="ScreenShort_of_the_project/manual review.jpeg" width="700"/>
  <br><b>Manual Review</b>
</p>

<p align="center">
  <img src="ScreenShort_of_the_project/history page.jpeg" width="700"/>
  <br><b>History Page</b>
</p>

<p align="center">
  <img src="ScreenShort_of_the_project/audit log.jpeg" width="700"/>
  <br><b>Audit Log</b>
</p>

---

## 📝 Notes

* Supports **real-world documents (PDF, DOCX, Images)**
* OCR required for scanned documents (Tesseract)
* Designed for **explainability & audit compliance**
* Easily extensible with ML/NLP in future

---

## 🔮 Future Improvements

* NLP-based legal clause extraction
* Advanced bidder scoring models
* Fraud detection & anomaly detection
* Cloud deployment & multi-user support

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

```bash
git clone https://github.com/your-username/NyayAI.git
cd NyayAI
```

---

### 🔹 Step 2: Run Backend (Flask)

```powershell
cd backend
pip install -r requirements.txt
python app.py
```

Backend will run at:
👉 http://localhost:5000

---

### 🔹 Step 3: Run Frontend (React)

```powershell
cd frontendReactPart
npm install
npm run dev
```

Frontend will run at:
👉 http://localhost:5173

---

### 🔹 Step 4: (Optional) Enable OCR

To process scanned documents:

1. Install **Tesseract OCR**
2. Add it to system PATH
   Example path:

   ```
   C:\Program Files\Tesseract-OCR
   ```

---

### 🔹 Step 5: One-Click Run (Recommended)

From root folder:

```powershell
.\run-all.ps1
```

---
```mermaid
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
