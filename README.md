# CustomerIQ — AI-Powered Customer Intelligence & Retention Platform

A ready-to-run MVP for uploading customer CSV data, profiling it, predicting churn (when a churn label exists), segmenting customers, and viewing a dashboard.

## Stack
- Backend: FastAPI + Python
- ML: scikit-learn
- Frontend: Next.js + TypeScript + Tailwind CSS
- Charts: Recharts
- Data: Pandas

## Requirements
- Python 3.11 or 3.12 recommended
- Node.js 20+
- npm

## 1. Start the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend:
http://127.0.0.1:8000

API docs:
http://127.0.0.1:8000/docs

## 2. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:
http://localhost:3000

## 3. Try the app

The dashboard starts with sample data. You can upload your own CSV from the Upload Data page.

### Expected optional churn column
If your dataset contains a column such as:
- churn
- churned
- is_churn
- customer_churn

the platform will attempt churn analysis.

If there is no churn label, analytics and segmentation still work.

## Project structure

customer-intelligence-platform/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── services/
│   │   │   ├── analytics.py
│   │   │   └── ml.py
│   │   └── api/
│   │       └── routes.py
│   ├── uploads/
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── upload/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── segments/page.tsx
│   │   └── globals.css
│   ├── lib/api.ts
│   ├── package.json
│   └── ...
└── data/
    └── sample_customers.csv

## Next production upgrades
1. PostgreSQL/Supabase
2. Authentication and company workspaces
3. Persistent datasets
4. Better model training/evaluation
5. Explainable AI with SHAP
6. AI assistant using an LLM + controlled analytics tools
7. Role-based access and tenant isolation
8. Deployment to Vercel + Render
