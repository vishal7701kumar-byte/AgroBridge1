# AgroBridge – Government Market Data Integration

## 1. Primary Authority & Data Source
AgroBridge connects directly to authentic agricultural wholesale market data released by the Ministry of Agriculture and Farmers Welfare through the **Open Government Data (OGD) Platform India** ([data.gov.in](https://data.gov.in/)):

- **Official Title**: *Current Daily Price of Various Commodities from Various Markets (Mandi)*
- **Permanent Resource ID**: `9ef84268-d588-465a-a308-a864a43d0070`
- **Primary Endpoint**: `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`
- **Reporting Cadence**: Daily APMC electronic returns from state agricultural marketing boards.

---

## 2. Security Architecture: Zero Frontend Key Exposure
A critical security rule enforced throughout AgroBridge is:
> **API keys are NEVER exposed to the frontend client bundle.**

1. All external HTTP requests to `data.gov.in` originate strictly from the backend Node.js runtime (`server/services/govMandiService.js`).
2. The OGD API Key is managed exclusively via the server environment:
   ```env
   OGD_INDIA_API_KEY=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b
   ```
3. Vite build files, frontend JavaScript bundles, and browser network inspectors only receive sanitized, normalized JSON payloads from internal `/api/market-prices` and `/api/ai` endpoints.

---

## 3. Data Ingestion, Cleaning & Normalization Pipeline

### A. Raw OGD Record Format
```json
{
  "state": "Madhya Pradesh",
  "district": "Bhopal",
  "market": "Bhopal",
  "commodity": "Tomato",
  "variety": "Hybrid",
  "arrival_date": "18/09/2026",
  "min_price": "2400",
  "max_price": "3200",
  "modal_price": "2800"
}
```

### B. Normalization & Conversion Rules
1. **Unit Standard (`₹/quintal` $\rightarrow$ `₹/kg`)**:
   - In Indian APMC mandis, prices are officially declared per quintal (1 quintal = 100 kg).
   - AgroBridge systematically converts all wholesale modal rates to per-kilogram values:
     $$\text{Price}_{\text{₹/kg}} = \frac{\text{modal\_price}}{100}$$
   - The raw `modal_price_quintal` is preserved in the data model for audit compliance.
2. **Date Standardization**:
   - Dates in `DD/MM/YYYY` format are normalized to ISO-8601 strings (`YYYY-MM-DD`).
3. **Commodity & Market String Cleansing**:
   - Case normalization and trim operations prevent duplicate records (e.g., `"Tomato"` vs `"tomato "`).

### C. Normalized JSON Structure
```json
{
  "state": "Madhya Pradesh",
  "district": "Bhopal",
  "market": "Bhopal",
  "commodity": "Tomato",
  "variety": "Hybrid",
  "arrival_date": "2026-09-18",
  "min_price": 24.00,
  "max_price": 32.00,
  "modal_price": 28.00,
  "modal_price_raw_quintal": 2800,
  "unit": "₹/kg",
  "source": "data.gov.in"
}
```

---

## 4. Multi-Tier Caching & Zero-Downtime Resilience
To accommodate intermittent government API latency, network timeouts, or rate limits:

```
┌─────────────────────────────────────────────────────────────────┐
│                 RESILIENT MARKET DATA CACHING                   │
│                                                                 │
│  [ data.gov.in API ]                                            │
│          │                                                      │
│          ▼ (Hourly poll / on-demand refresh)                    │
│  [ Node.js In-Memory Cache ]                                    │
│          │                                                      │
│          ▼ (Persistent sync)                                    │
│  [ server/data/gov_mandi_cache.json ] (554 Records, 90 Days)   │
│          │                                                      │
│          ▼                                                      │
│  [ Python ML Service / Node.js Bridge ]                         │
│          │                                                      │
│          ▼                                                      │
│  [ AgroBridge Farmer & Admin UI ]                               │
└─────────────────────────────────────────────────────────────────┘
```

1. **Tier 1: High-Speed In-Memory Cache**: Active market lookups are served in $<2\text{ms}$.
2. **Tier 2: Persistent Local JSON Store** (`server/data/gov_mandi_cache.json`): Contains 554 authentic records spanning 90 days of trading across 7 core commodities (Tomato, Potato, Onion, Wheat, Soyabean, Cucumber, Apple).
3. **Tier 3: Graceful Offline Fallback**: If the live government API is unreachable, the system automatically falls back to the most recent cached records and labels the response with `source: 'cache'`.
4. **Strict Truth-in-Data Protocol**: If no real market data exists for an unmapped crop or mandi, **the system refuses to generate fake or randomized numbers**, returning:
   ```json
   {
     "success": true,
     "data": null,
     "message": "Market price data currently unavailable for this commodity in the selected APMC."
   }
   ```

---

## 5. Supported Commodities & Primary APMC Benchmark Mandis

| Commodity | Variety | Primary Benchmark APMC | State | 90-Day Range (₹/kg) |
|:---|:---|:---|:---|:---:|
| **Tomato** | Hybrid, Deshi, Local | Bhopal APMC | Madhya Pradesh | ₹22.00 – ₹34.50 |
| **Potato** | Pukhraj, Jyoti, Local | Bhopal APMC | Madhya Pradesh | ₹18.00 – ₹25.00 |
| **Onion** | Red, Nasik Local, White | Lasalgaon / Bhopal | Maharashtra / MP | ₹24.00 – ₹38.00 |
| **Wheat** | Sharbati, Lokwan, Grade A | Sehore APMC | Madhya Pradesh | ₹28.50 – ₹33.00 |
| **Soyabean** | Yellow, JS-335, FAQ | Indore APMC | Madhya Pradesh | ₹42.00 – ₹49.50 |
| **Cucumber** | Local, Green, Hybrid | Bhopal APMC | Madhya Pradesh | ₹16.00 – ₹24.00 |
| **Apple** | Royal Delicious, Golden | Shimla APMC | Himachal Pradesh | ₹75.00 – ₹98.00 |

---

## 6. API Endpoints

### 1. `GET /api/market-prices`
Filterable by `commodity`, `market`, `state`, `date`. Returns paginated list of normalized APMC records.

### 2. `GET /api/market-prices/history`
Returns chronological trading history for chart visualization:
```json
{
  "success": true,
  "data": [
    { "date": "2026-06-20", "modalPrice": 24.50, "minPrice": 22.00, "maxPrice": 27.00 },
    { "date": "2026-06-21", "modalPrice": 25.00, "minPrice": 22.50, "maxPrice": 27.50 }
  ],
  "commodity": "Tomato",
  "market": "Bhopal",
  "recordCount": 90
}
```

### 3. `GET /api/market-prices/status`
Telemetry endpoint returning cache timestamp, total records, active source, and external connectivity status.

### 4. `POST /api/market-prices/refresh`
Triggers an immediate upstream synchronization with `data.gov.in`.
