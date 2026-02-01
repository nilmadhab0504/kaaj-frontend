# Lender Matching Platform – Frontend

Next.js + TypeScript app for loan applications, underwriting results, and lender policy management.

## Prerequisites

- Node.js 18+
- Backend API running (see [backend/README.md](../backend/README.md)). Default: `http://localhost:3005`.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Configure API URL. The app defaults to `http://localhost:3005`. To override:
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:3005" >> .env.local
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Running with the backend

1. Start the **backend** first (from `backend/`: `python run.py`).
2. Then start the frontend (`npm run dev`). The app will call the API for applications, underwriting, and lenders.

## Main flows

- **Applications** – Create application, view detail, submit, run underwriting, view results (eligible/ineligible lenders with criteria breakdown).
- **Results** – Per-lender fit score, best program, rejection reasons, and per-criterion met/not met with expected vs actual.
- **Lenders** – List lenders, view/edit lender, add/edit/delete programs and criteria. Add new lender from PDF via “Add lender” and Parse PDF.
