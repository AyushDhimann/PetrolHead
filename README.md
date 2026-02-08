# 🚀 Nawgati — Fuel Station Profile Dashboard

**AI-powered deep research & forensic intelligence dashboard for fuel station competitive analysis**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-teal?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-green?logo=python)](https://www.python.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Dashboard Components](#dashboard-components)
- [Caching](#caching)
- [Advanced](#advanced)

---

## 🎯 Overview

Nawgati is a full-stack intelligence platform that transforms plaintext fuel station reports into interactive, forensic-grade dashboards. It extracts and visualizes:

- **Identity & Litigation Profiles** — Station details, key personnel, ownership history, and legal disputes
- **Operational Intelligence** — Fuel significance, automation, safety compliance, non-fuel retail
- **Competitive Analysis** — Threat levels, comparative metrics, catchment splits, market saturation
- **Financial Metrics** — OPEX breakdown, dealer margins, GST turnover, revenue estimates
- **Location Risk** — Demand drivers with seasonal variations, infrastructure risks, access analysis
- **Customer Sentiment** — Platform-specific ratings, review anomalies, theme analysis
- **Strategic Score** — Methodology-weighted scoring with drill-down reasoning
- **Anomalies & Leftovers** — Data anomalies, environmental compliance, miscellaneous intel, future outlook

**Agentic Chat:** Natural language Q&A over the station profile with streaming responses powered by **Gemini 2.5 Flash**.

---

## ✨ Features

### 🧠 Forensic Extraction
- **Vercel AI SDK** with **Zod** schemas for structured data extraction
- **Gemini 2.5 Flash Lite** for fast, cost-effective analysis
- Forensic prompts that capture specific evidence (plaintiff names, exact allegations, seasonal details)
- Avoids "smoothing effect" — surfaces raw data, not summaries

### 💾 Intelligent Caching
- **File-system cache** (MD5 hash of report text) in `.cache/extractions/`
- Eliminates duplicate API calls on repeated dashboard loads
- Console logs `CACHE HIT/MISS` for transparency
- Session-independent persistence

### 🎨 Rich Data Visualization
- **8 interactive pastel-themed cards** in a responsive bento grid layout
- **Litigation profile** with specific cases and source quotes
- **Comparative metrics table** for competitor benchmarking
- **OPEX breakdown** and dealer margin charts
- **Demand drivers timeline** with peak seasons
- **Sentiment heatmap** with platform disparities
- **Future outlook timeline** for strategic planning

### 💬 Agentic Chat Widget
- Floating chat panel (bottom-right corner)
- Streaming responses from Claude/Gemini with full report context
- Clear history, smooth animations
- No session persistence (fresh per load, or use cookies for persistence)

### ⚡ CLI Runner
- `python -m nawgati setup` — Install all dependencies
- `python -m nawgati run` — Start backend (FastAPI) + frontend (Next.js) concurrently
- Cross-platform (Windows, macOS, Linux)
- Graceful shutdown with Ctrl+C

---

## 🛠 Tech Stack

### Backend
- **FastAPI** — High-performance API framework
- **Python 3.11+** — Core runtime
- **Google Generative AI** — LLM for extraction
- **Pydantic** — Data validation
- **Uvicorn** — ASGI server

### Frontend
- **Next.js 16.1.6** — React meta-framework
- **React 19.2.3** — UI library
- **TypeScript** — Type safety
- **Tailwind CSS v4** — Utility-first styling
- **Vercel AI SDK v6** — LLM streaming & chat hooks
- **Zod** — Runtime schema validation
- **Framer Motion** — Animation library
- **Lucide React** — Icon set
- **Recharts** — Data visualization

### Infrastructure
- **Port 8000** — Backend API
- **Port 3000** — Frontend dev server
- **.env.local** — Environment configuration

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### 1. Clone & Setup

```bash
# Navigate to project
cd Nawgati-Assignment

# Install all dependencies (backend + frontend)
python -m nawgati setup
```

### 2. Environment Setup

Create `.env` files:

**Backend** (`backend/.env`):
```env
GEMINI_API_KEY=your_google_api_key_here
PERPLEXITY_API_KEY=your_perplexity_key_here (optional)
DEMO_MODE_ENABLED=true
PRIMARY_PROVIDER=gemini
FALLBACK_PROVIDER=perplexity
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
```

### 3. Run Full Stack

```bash
# Start both backend & frontend with one command
python -m nawgati run

# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### 4. Access the Dashboard

1. Open http://localhost:3000
2. Click on a **Demo** (DO1, DO2, DO3)
3. Watch the dashboard load with 8 data-rich cards
4. Try the floating **Nawgati Analyst** chat on the bottom-right

---

## 📁 Project Structure

```
Nawgati-Assignment/
├── backend/                           # FastAPI backend
│   ├── main.py                       # App entry point
│   ├── requirements.txt               # Python dependencies
│   ├── .env                          # API keys
│   ├── config/
│   │   ├── settings.py               # Configuration
│   │   └── logging_config.py         # Logging setup
│   ├── features/
│   │   ├── research/                 # Deep research (web scraping)
│   │   ├── converter/                # Text extraction
│   │   ├── dashboard/                # Dashboard endpoints
│   │   │   └── router.py             # /api/dashboard/demo/{id}/text
│   │   └── session/                  # Session management
│   └── demo_outputs/
│       ├── JSONS/                    # Pre-generated demo data
│       └── PlainTexts/               # Demo report files (DO1-DO3)
│
├── frontend/                          # Next.js frontend
│   ├── package.json                  # Node dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── tailwind.config.ts            # Tailwind configuration
│   ├── .env.local                    # API keys
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── demos.tsx             # Demos listing
│   │   │   ├── api/
│   │   │   │   └── chat/route.ts     # Chat API endpoint
│   │   │   ├── demo/
│   │   │   │   └── [id]/page.tsx     # Dashboard page
│   │   │   ├── research/
│   │   │   │   └── [sessionId]/      # Live research page
│   │   │   ├── layout.tsx            # Root layout
│   │   │   └── globals.css           # Global styles
│   │   ├── schemas/
│   │   │   └── dashboard.ts          # 8 Zod schemas (forensic)
│   │   ├── actions/
│   │   │   └── extract.ts            # Server actions + caching
│   │   ├── components/
│   │   │   └── dashboard/
│   │   │       ├── Skeletons.tsx     # 8 loading skeletons
│   │   │       ├── IdentityCard.tsx
│   │   │       ├── OperationalCard.tsx
│   │   │       ├── CompetitorCard.tsx
│   │   │       ├── FinancialCard.tsx
│   │   │       ├── LocationCard.tsx
│   │   │       ├── SentimentCard.tsx
│   │   │       ├── ScoreCard.tsx
│   │   │       ├── AnomaliesCard.tsx
│   │   │       └── ChatWidget.tsx    # Agentic chat panel
│   │   └── lib/
│   │       └── api.ts                # API client
│   ├── .cache/
│   │   └── extractions/              # Hash-based cache directory
│   └── public/                       # Static assets
│
├── nawgati/                          # CLI package
│   ├── __init__.py
│   ├── __main__.py                   # Entry point: `python -m nawgati`
│   ├── run.py                        # Runner: starts backend + frontend
│   └── setup.py                      # Setup: installs dependencies
│
├── README.md                         # This file
├── LICENSE
├── demand.md                         # Requirements document
└── mega_prompt.txt                   # System prompt for research
```

---

## 🎮 Usage

### Run Dashboard Demo

1. **Start the stack:**
   ```bash
   python -m nawgati run
   ```

2. **Open http://localhost:3000**

3. **Click a Demo Card:**
   - **Demo 1**: Sher Service Station (IndianOil, Janakpuri)
   - **Demo 2**: Jay Garud Gas Station (IndianOil, Janakpuri)
   - **Demo 3**: Jai Shree Ganesh Filling Station (BPCL, NH-44)

4. **Watch the Dashboard Load:**
   - Progressive extraction via Suspense
   - Skeletons for instant feedback
   - Cache HIT/MISS logged to console
   - 8 forensic cards populate in 2-3 seconds

5. **Chat with the Analyst:**
   - Click the 💬 button (bottom-right)
   - Ask questions like:
     - "What are the litigation risks?"
     - "How does this station compare to competitors?"
     - "What's the revenue estimate?"
     - "Are there environmental compliance issues?"

### Extract Custom Report

1. **Backend API** (POST to `/api/dashboard/demo/{id}/extract`):
   ```bash
   curl -X GET http://localhost:8000/api/dashboard/demo/1/text
   ```

2. **Returns plaintext report**, which frontend then extracts via 8 parallel server actions.

---

## 🔌 API Reference

### Backend Endpoints

#### Dashboard
- **`GET /api/dashboard/demo/{id}/text`** — Fetch plaintext report for a demo

#### Session
- **`POST /api/session/save`** — Save extraction session
- **`GET /api/session/{sessionId}`** — Retrieve session

#### Health
- **`GET /api/health`** — Service status

### Frontend API Routes

#### Chat
- **`POST /api/chat`** — Stream chat responses
  
  **Body:**
  ```json
  {
    "messages": [
      { "id": "1", "role": "user", "parts": [{ "type": "text", "text": "..." }] }
    ],
    "reportText": "Full station report text..."
  }
  ```
  
  **Response:** Server-sent events (SSE) stream with UIMessageChunk format

---

## 🎨 Dashboard Components

### 1. IdentityCard
Shows station fundamentals, brand, owner, established year, key personnel (name/role/source), ownership history, litigation profile with specific cases (plaintiff → allegation → status), and risk factors.

**Forensic Fields:**
- `keyPersonnel`: Array of {name, role, source}
- `litigationProfile`: {riskLevel, specificCases[{plaintiff, allegation, status, sourceQuote}]}
- `ownershipHistory`: Chronological ownership changes

### 2. OperationalCard
Fuel types with significance levels, automation/EV status, amenities, non-fuel retail, safety compliance (certification name + details), forecourt layout, and dispenser info.

**Forensic Fields:**
- `fuelTypes[].significance`: Why this fuel matters (e.g., "High demand due to highway traffic")
- `nonFuelRetail[]`: Specific retail offerings
- `safetyCompliance[]{certification, details}`

### 3. CompetitorCard
Market saturation badge, competitor list with threat levels (Critical/High/Medium/Low), distance, rating, and key strengths. Includes catchment split %, comparative metrics table (Subject vs Competitors), and "Our Moat" section.

**Forensic Fields:**
- `competitors[].threatLevel`: Enum for risk assessment
- `catchmentSplit`: Geographic breakdown
- `comparativeTable[]`: {metric, subjectValue, competitorValues{}}

### 4. FinancialCard
Estimated monthly throughput (petrol/diesel/CNG), revenue/OPEX/net income estimates, GST turnover category, OPEX breakdown table (staff, electricity, maintenance), and dealer margins per fuel type.

**Forensic Fields:**
- `opexBreakdown[]{item, amount}`: Granular expense breakdown
- `dealerMargins[]{fuelType, margin}`: Per-fuel-type profitability
- `gstTurnoverCategory`: Categorical turnover band

### 5. LocationCard
Catchment type & demographics, access analysis, peak demand hours, seasonal demand drivers with peak months and impact type (High/Medium/Low), infrastructure risks (binary risk flags for RRTS/flyover construction), and nearby landmarks.

**Forensic Fields:**
- `demandDrivers[]{driver, peakMonths[], impactType, details}`: Seasonal specifics
- `infrastructureRisks[]{risk, details, isBinaryRisk}`: Construction, highway work

### 6. SentimentCard
Overall rating, total review count, sentiment verdict, platform breakdown (Justdial vs Google Maps with anomaly notes), positive/negative themes, notable review quotes with sentiment coloring, and digital presence score.

**Forensic Fields:**
- `platformBreakdown[]{platform, rating, reviewCount, note}`: Platform disparities
- `notableReviews[]{quote, sentiment, theme}`: Exemplary reviews

### 7. ScoreCard
SVG progress ring, overall score with verdict badge, subscores breakdown (categories with max points and reasoning), scoring methodology weights, and recommendations.

**Forensic Fields:**
- `scoringMethodology[]{dimension, weight}`: Transparent weighting
- `subscores[]{category, score, maxScore, reasoning}`: Detailed scoring logic

### 8. AnomaliesCard
**Data Anomalies**: Unusual data points (e.g., "Oxygen Filling Services" at a petrol pump) with confidence levels and implications.

**Environmental Compliance**: DPCC category, trigger reason, consent status, and compliance items.

**Miscellaneous Intel**: Categorized facts (e.g., "Staff Culture", "Operational Quirks").

**Future Outlook**: Strategic topics with 12-month outlook (risks, growth, initiatives).

---

## 💾 Caching

### How It Works

1. **Request arrives** → Extract text from plaintext report
2. **MD5 hash** of text is computed → e.g., `abc123def456`
3. **Cache check** → `.cache/extractions/{section}_{hash}.json` exists?
   - **HIT**: Return cached JSON
   - **MISS**: Call Gemini API
4. **Response written** to cache directory for future requests
5. **Console logs** `[CACHE HIT]` or `[CACHE MISS]` per section

### Cache Structure

```
frontend/.cache/extractions/
├── identity_abc123def456.json
├── operational_abc123def456.json
├── competitors_abc123def456.json
├── financial_abc123def456.json
├── location_abc123def456.json
├── sentiment_abc123def456.json
├── score_abc123def456.json
└── anomalies_abc123def456.json
```

### Benefits

- **Cost**: Eliminates repeated $$ API calls
- **Speed**: Instant response on cache hits (~0ms vs 2-3s)
- **Transparency**: Console logs show cache state
- **Session-Independent**: Works across sessions/devices

---

## 🎯 Advanced

### Running Backend Only

```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Running Frontend Only

```bash
cd frontend
npm run dev
```

### Environment Variables

**Backend** (`.env`):
- `GEMINI_API_KEY` — Google Generative AI key
- `PERPLEXITY_API_KEY` — Perplexity API key (optional fallback)
- `DEMO_MODE_ENABLED` — Enable demo endpoints (true/false)
- `PRIMARY_PROVIDER` — Default LLM provider (gemini/perplexity)
- `FALLBACK_PROVIDER` — Fallback provider
- `CORS_ORIGINS` — Allowed CORS origins (default: http://localhost:3000)

**Frontend** (`.env.local`):
- `NEXT_PUBLIC_API_URL` — Backend URL (default: http://localhost:8000)
- `GOOGLE_GENERATIVE_AI_API_KEY` — For Vercel AI SDK

### Building for Production

```bash
# Frontend
cd frontend
npm run build
npm start

# Backend (separate terminal)
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Adding a New Card

1. **Create Zod schema** in `frontend/src/schemas/dashboard.ts`
2. **Create server action** in `frontend/src/actions/extract.ts`
3. **Create skeleton loader** in `frontend/src/components/dashboard/Skeletons.tsx`
4. **Create card component** in `frontend/src/components/dashboard/YourCard.tsx`
5. **Add to demo page** in `frontend/src/app/demo/[id]/page.tsx`

---

## 📊 Sample Report Data

The project includes 3 pre-built demo reports:

- **DO1.txt**: Sher Service Station (Janakpuri, Delhi)
- **DO2.txt**: Jay Garud Gas Station (Janakpuri, Delhi)
- **DO3.txt**: Jai Shree Ganesh Filling Station (NH-44, Delhi)

These are loaded by the backend and serve as test data for the dashboard.

---

## 🤝 Contributing

To add features or fix issues:

1. Create a feature branch
2. Make your changes
3. Test locally with `python -m nawgati run`
4. Build: `npm run build` (frontend) + verify backend logs
5. Submit changes

---

## 📄 License

See [LICENSE](LICENSE) file.

---

## 📞 Support

For questions or issues:
- Check the [demand.md](demand.md) requirements document
- Review [mega_prompt.txt](mega_prompt.txt) for system prompt details
- Inspect backend logs at `/backend/demo_outputs/logs/`

---

**Built with ❤️ using Next.js, FastAPI, and Gemini AI**
