# NYC Airbnb Market Intelligence
## Foundations of Data Science (23CSE351) Final Case Study
### Statistical Analysis, Hypothesis Testing, Machine Learning, Tableau & Full-Stack Web Application

---

## 1. Project Overview & Identity
- **Course:** 23CSE351 — Foundations of Data Science (FODS)
- **Product Title:** NYC Airbnb Market Intelligence
- **Subtitle:** *Exploring Listing Prices, Room Types, Neighbourhood Patterns and Availability in New York City*
- **Aesthetic:** Airbnb-inspired hospitality & data journalism (warm off-white `#FAF9F5`, coral accents `#FF5A5F`, dark charcoal `#222222`).
- **Core Principles:** This is a Data Science case study, not an opaque ML-only project. Data analysis, rigorous inferential hypothesis testing, foundational linear algebra, probability modeling, and Central Limit Theorem validation are central.

---

## 2. Official Evaluation Rubrics Mapping (20 Marks Total)
| Criteria | Marks | Project Implementation & Verification |
|---|---|---|
| **Data Preprocessing** | **2 Marks** | Imputed reviews with 0.0, filtered 11 invalid $0 records, bounded stay <= 365 nights, 99th-percentile Winsorization ($799), variance-stabilizing `log1p` transformation. |
| **Problem Understanding & Analysis Questions** | **3 Marks** | Formulated and completely solved **18 distinct research questions** with empirical calculations, visualizations, justifications, and evidence-based conclusions. |
| **Hypothesis Formulation & Suitable Testing** | **8 Marks** | Implemented 4 core inferential tests — Welch's two-sample t-test ($t=175.88, d=1.61$, A/B comparison), One-Way ANOVA & Kruskal-Wallis ($F=1{,}928.01, \eta^2=0.136$), Chi-Square test of independence ($\chi^2=1{,}557.95, V=0.126$), and Availability-Price correlation ($r=0.0978, p=4.0\times 10^{-104}$) — plus a **14-test Holm–Bonferroni register** controlling family-wise error across every question. |
| **Regression & Prediction and Visualization** | **7 Marks** | Held-out 80:20 train-test split (zero data leakage). Evaluated Linear Regression baseline ($R^2=0.538$), Ridge ($R^2=0.538$), Random Forest Regressor ($R^2=0.633$, Dollar $\text{MAE}=\$47.48$) and Gradient Boosting ($R^2=0.631$, $\text{MAE}=\$48.19$) with VIF/standardized-$\beta$, permutation importance, 5-fold cross-validation, residual diagnostics (Breusch-Pagan, Durbin-Watson, Jarque-Bera/Shapiro-Wilk), naive-baseline benchmarks, What-If prediction intervals and feature importances. |
| **Total Official Marks** | **20 Marks** | Full-stack application and Tableau dashboard included as verified deliverables. |

---

## 3. Dataset Provenance & Key Numbers
- **Dataset Name:** New York City Airbnb Open Data (2019)
- **Source URL:** [Inside Airbnb Open Data Archive](https://raw.githubusercontent.com/alexeygrigorev/datasets/master/AB_NYC_2019.csv)
- **Raw Observations:** 48,895 records across 16 attributes
- **Cleaned Observations:** 48,870 verified records across 20 transformed attributes
- **Target Measures:**
  - Raw Price: Mean = $152.76, Median = $106.00, Skewness = 19.12 (severe right skew)
  - 99th Percentile Capped Price ($799 cap): Mean = $143.99, Median = $106.00, Skewness = 2.78
  - Natural Log Price: $\ln(1 + \text{price})$, Mean = 4.73, Std = 0.67, Skewness = 0.37 (Gaussian symmetry)
- **Geographic Coverage:** 5 NYC Boroughs, 221 discrete micro-neighbourhoods

---

## 4. Directory & Deliverables Structure

```
FODS_Final_Submission/
├── README.md                           <- Comprehensive documentation and run guide
├── server.py                           <- Single-command entry point (serves the React build + full REST API)
├── requirements.txt                    <- Python dependencies
├── data/
│   ├── raw/
│   │   └── AB_NYC_2019.csv             <- Ingested raw dataset (7.08 MB)
│   └── processed/
│       ├── cleaned_airbnb.csv          <- Cleaned dataset (48,870 rows, 20 features)
│       └── NYC_Airbnb_Tableau_Data.csv <- Tableau-ready curated dataset
├── notebooks/
│   └── FODS_Final_Case_Study_Airbnb.ipynb <- Complete executed Jupyter notebook with outputs (18 questions)
├── backend/
│   ├── app.py                         <- Production-grade Flask REST API server
│   ├── build_complete_analytics.py    <- End-to-end data processing and model pipeline
│   ├── test_api.py                    <- Rigorous unit test suite for all endpoints
│   ├── analysis_results.json          <- Precomputed master analytics payload
│   └── trained_model_pipeline.pkl     <- Serialized Random Forest model pipeline
├── frontend/                          <- React 19 + Vite + Tailwind + Recharts + Lucide UI
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── dist/                          <- Precompiled production bundle
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── data/
│       │   ├── analysis_results.json   <- Offline analytics payload (mirrors backend)
│       │   └── tableau.js              <- Paste your Tableau Public URL here
│       └── components/
│           ├── Navbar.jsx             <- Sticky navigation and live API status pill
│           ├── Overview.jsx           <- Executive KPI cards & Recharts distributions
│           ├── ExploreMarket.jsx      <- Dynamic filters, search, cards/table, CSV export
│           ├── ResearchQuestions.jsx  <- All 18 FODS research questions
│           ├── StatisticalEvidence.jsx<- Hypothesis testing & A/B comparison matrix
│           ├── PricePrediction.jsx    <- Real-time valuation calculator
│           ├── MarketExplorer.jsx     <- Side-by-side comparative analytics tool
│           ├── TableauDashboard.jsx   <- Live Tableau Public workbook embed
│           └── AboutStudy.jsx         <- Academic data dictionary & study provenance
├── reports/
│   ├── FODS_Final_Case_Study_Report.docx       <- Official case study report with figures
│   ├── FODS_Final_Case_Study_Presentation.pptx <- 12-slide presentation (16:9 widescreen)
│   ├── build_docx_report.py
│   └── build_pptx_presentation.py
├── tableau/
│   ├── NYC_Airbnb_Market_Insights_2019.twb    <- Native Tableau XML workbook
│   ├── NYC_Airbnb_Tableau_Data.csv            <- Tableau data source
│   └── TABLEAU_DASHBOARD_GUIDE.md             <- Click-by-click construction instructions
└── outputs/
    └── figures/                               <- 18 High-resolution analytical charts (.png)
```

---

## 5. Execution & Startup Instructions

### 5.1 Environment Prerequisites
- Python 3.10+ (Tested on Python 3.12.5)
- Node.js v18+ and npm v9+ (Tested on Node v22.14.0, npm 10.9.2)

### 5.2 Python Dependencies Installation
From the root directory (`FODS_Final_Submission`):
```bash
pip install -r requirements.txt
```

### 5.3 Executing the Jupyter Notebook
The notebook has been fully executed and saved with all plots, tables, and outputs embedded. To re-run or open in Jupyter:
```bash
cd notebooks
jupyter notebook FODS_Final_Case_Study_Airbnb.ipynb
```
Or execute headless:
```bash
jupyter nbconvert --to notebook --execute FODS_Final_Case_Study_Airbnb.ipynb --inplace
```

### 5.4 Starting the Backend REST API
The Flask backend serves analytical statistics, listing search, comparative insights, and real-time model inference on port 5000:
```bash
cd backend
python app.py
```
*Health Check:* Open `http://localhost:5000/api/health` in your browser.

### 5.5 Starting the Frontend React Application
Open a new terminal window:
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your browser to experience the interactive analytics platform.

*Production Build Preview:*
```bash
cd frontend
npm run preview
```

### 5.6 Single-Command Startup (Recommended)
Instead of running two processes, start the whole application from the repository root:
```bash
python server.py
```
`server.py` is the top-level entry point: it mounts the complete Flask REST API from `backend/app.py`
and serves the compiled React bundle from `frontend/dist` on one origin (default port 5000).

- Web application: `http://localhost:5000/`
- REST API health: `http://localhost:5000/api/health`
- Override the port with `PORT=8080 python server.py`

Method routes (`/api/...`) always take precedence; any other path falls back to `index.html` so
client-side navigation works on refresh. Re-run `npm run build` in `frontend/` after any UI source change,
otherwise the served bundle is the previously compiled one.

### 5.7 Deployment (Production)
Deploy as a **single Python web service** so the UI and the API share one origin — this avoids CORS,
avoids proxy configuration, and leaves the relative `/api/...` calls and the Tableau embed working as-is:

| Setting | Value |
|---|---|
| Build command | `cd frontend && npm ci && npm run build` |
| Start command | `gunicorn server:app --bind 0.0.0.0:$PORT --timeout 120` |
| Python version | 3.12 (add `runtime.txt` containing `python-3.12.5` if the host requests one) |

Compatible with Render, Railway, Fly.io, or any Docker/VM host. The port is read from `$PORT`.
Static-only hosts (GitHub Pages, Netlify, Vercel) can serve `frontend/dist`, but the live endpoints
(`/api/predict`, `/api/listings`, `/api/compare`) will be unavailable there — the UI then renders its
bundled `analysis_results.json` snapshot, so it degrades gracefully rather than breaking.

**One-click deploy on Render (recommended):** the repository root contains a `render.yaml` Blueprint with the
commands above already configured. In the Render Dashboard choose **New +** → **Blueprint** → select this
repository → **Apply**. Render builds the React bundle, installs the Python dependencies, starts
`gunicorn server:app`, and health-checks `/api/health`.

> **Memory note:** the free tier provides 512 MB RAM, and the resident set (pandas + scikit-learn +
> the 65 MB Random Forest) sits near that ceiling. `render.yaml` therefore pins Gunicorn to a single worker
> with threads. If the service is restarted for exceeding memory, move it to a larger plan rather than
> adding workers.

> **Runtime independence:** the website does **not** execute the Jupyter notebook. The notebook in
> `notebooks/` is an independent, fully executed academic deliverable. The site's figures come from
> `backend/build_complete_analytics.py`, which writes `backend/analysis_results.json` (served by the API),
> a mirrored copy bundled into `frontend/src/data/` (offline fallback), and
> `backend/trained_model_pipeline.pkl` (used by `/api/predict`).

---

## 6. Backend API Endpoint Reference

| HTTP Method | Route | Description & Payloads |
|---|---|---|
| `GET` | `/api/health` | Health check verifying API status, dataset row count, and model readiness. |
| `GET` | `/api/summary` | Executive KPIs: total listings, median/mean prices, borough counts, and room type percentages. |
| `GET` | `/api/filters` | Dynamic filter criteria: boroughs, micro-neighbourhoods, room types, price ranges. |
| `GET` | `/api/listings` | Filtered, paginated listing records. Query params: `borough`, `room_type`, `search`, `max_price`, `page`, `limit`. |
| `GET` | `/api/price-distribution` | Histogram bins and skewness statistics for interactive distribution charting. |
| `GET` | `/api/borough-analysis` | Five-number summary statistics for all 5 NYC boroughs. |
| `GET` | `/api/room-type-analysis` | Pricing and inventory breakdowns across Entire home, Private room, and Shared room. |
| `GET` | `/api/neighbourhood-analysis`| Top 10 most expensive micro-markets filtered by sample threshold ($n \ge 25$). |
| `GET` | `/api/availability-analysis` | Market segmentation: Zero availability (35.8%) vs Year-round commercial rentals (16.5%). |
| `GET` | `/api/questions` | Master analytical results for all 18 research questions. |
| `GET` | `/api/hypothesis-tests` | Formulations, statistics, p-values, effect sizes, decisions, and the 14-test Holm–Bonferroni register. |
| `GET` | `/api/model-metrics` | Comparative evaluation: Linear Regression vs Ridge vs Random Forest Regressor ($R^2$, MAE, RMSE). |
| `POST` | `/api/predict` | Real-time price inference via trained Random Forest pipeline. Takes JSON payload and returns estimated nightly rate with 90% confidence interval. |
| `GET` | `/api/compare` | Side-by-side comparative analytics for any two boroughs or room types with percentage delta calculation. |

---

## 7. Tableau Visual Analytics Deliverable

- **Tableau CSV:** `data/processed/NYC_Airbnb_Tableau_Data.csv` (and mirrored in `tableau/`).
- **Tableau Workbook:** `tableau/NYC_Airbnb_Market_Insights_2019.twb`.
- **Step-by-Step Construction Guide:** `tableau/TABLEAU_DASHBOARD_GUIDE.md`.
- **In-app Tableau tab:** the **Tableau Dashboard** tab in the web application embeds the published Tableau Public
  workbook live (executive KPIs, borough & neighbourhood rankings, room pricing, availability scatter, inventory
  composition).

### Connecting the live Tableau embed (one step):
Publish the workbook to Tableau Public (`File -> Save to Tableau Public As...`), copy the public share link, then
paste it into **either** of these two places (the JS module takes priority):
1. `frontend/src/data/tableau.js` -> set `TABLEAU_URL = 'https://public.tableau.com/views/...'`
2. `frontend/public/tableau.config.json` -> `{ "url": "https://public.tableau.com/views/..." }`

Until a URL is provided, the tab shows an "awaiting public URL" panel with the full six-worksheet specification
(never a broken iframe).

### Quick Tableau Setup:
1. Open **Tableau Desktop**.
2. Click **Connect -> Text file** and select `tableau/NYC_Airbnb_Tableau_Data.csv`.
3. Open `NYC_Airbnb_Market_Insights_2019.twb` or follow `TABLEAU_DASHBOARD_GUIDE.md` to customize sheets:
   - *Sheet 1:* KPI Executive Cards (`CNT(id)`, `MEDIAN(price_capped)`, `AVG(price_capped)`).
   - *Sheet 2:* Borough Price Ranking (`neighbourhood_group` vs `MEDIAN(price_capped)`).
   - *Sheet 3:* Room Exclusivity Pricing (`room_type` vs `AVG(price_capped)`).
   - *Sheet 4:* Top 10 Most Expensive Neighbourhoods (Filtered by `CNT(id) >= 25`).
   - *Sheet 5:* Annual Availability vs Price Scatter with Trend Lines.
   - *Sheet 6:* Room Type Proportional Breakdown by Borough (100% Stacked Bar).

---

## 8. Summary of Major Empirical Findings
1. **The Price Distribution is Fundamentally Log-Normal:** Raw prices exhibit severe positive skewness (19.12). The arithmetic mean ($152.76) overstates true market center by 44% compared to the median ($106.00). Applying $\ln(1 + \text{price})$ yields near-zero skewness (0.37).
2. **Geographic Price Hierarchy:** Manhattan commands a median nightly rate of $150, representing a 66.7% premium over Brooklyn ($90) and 130.8% over Bronx ($65).
3. **Room Type Exclusivity Premium:** Entire homes command an average of $198.35/night vs $86.03 for private rooms (a 2.31x premium). Welch's t-test confirms a massive Cohen's $d$ of 1.61.
4. **Regulatory Enforcement Signature:** 3,674 listings (7.5% of the market) mandate minimum stays $\ge 30$ nights, aligning with NYC's Multiple Dwelling Law threshold to operate legally outside short-term restriction mandates.
5. **Central Limit Theorem Empirically Validated:** Sampling distributions drawn from heavily skewed prices converge to Gaussian normality at $n = 100$ with empirical standard error ($12.79) matching theoretical standard error ($12.19 = 121.94 / \sqrt{100}$).

---

## 9. Methodological & Temporal Limitations
- **2019 Temporal Boundary:** This dataset reflects the market in calendar year 2019. It must not be presented as a description of current post-2023 NYC short-term rentals, which underwent significant restructuring under **NYC Local Law 18** (banning unhosted short-term rentals under 30 days).
- **Observational Nature:** All statistical tests represent observational comparisons of secondary market listings, not randomized controlled experiments.
- **Omitted Variable Bias:** The dataset lacks square footage, bathroom count, interior architectural quality, and specific amenities (air conditioning, elevator, balcony).

---

## 10. Academic Integrity & Verification
- Original student files (`Lab_Eval_1_Final.ipynb`) have been strictly preserved without modification.
- All numbers, p-values, regression metrics, and figures were computed directly from the live dataset using Python 3.12, SciPy, and Scikit-Learn.
- Generated deliverables are mirrored in both `FODS_Final_Submission/` and `SEM-Stuff/fods/` for evaluation access.
