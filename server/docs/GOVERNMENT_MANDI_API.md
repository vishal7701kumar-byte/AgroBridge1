# AgroBridge - Government Mandi Price Data Integration Documentation

## 1. Overview & Dataset Details

AgroBridge integrates official agricultural commodity price data directly from the **Government of India's Open Government Data (OGD) Platform** to provide authentic, transparent, and fair market price references for farmers and buyers.

- **Primary Source:** Government of India Open Government Data (OGD) Platform ([data.gov.in](https://data.gov.in/))
- **Ministry / Department:** Ministry of Agriculture and Farmers Welfare / Directorate of Marketing & Inspection (DMI) / AGMARKNET
- **Dataset Title:** *Current Daily Price of Various Commodities from Various Markets (Mandi)*
- **Catalog Resource ID:** `9ef84268-d588-465a-a308-a864a43d0070`
- **Official Portal Link:** [https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi](https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi)

---

## 2. Core Architectural Principles & Truth-in-Data

1. **Strict Truth-in-Data ("No Fake Prices"):**
   - Fake, estimated, or synthetic prices are **NEVER fabricated**.
   - If government data is temporarily unavailable or a specific crop has no active mandi arrival report for the day, AgroBridge explicitly states:
     `"Government mandi price data is currently unavailable."` or `"No government mandi price records found for the selected filters."`
2. **Clear Separation of Farmer Price vs. Mandi Benchmark:**
   - **Farmer's Listed Price:** Sourced exclusively from the AgroBridge MongoDB database (`product.price_per_kg`), set directly by the farmer. It is NEVER modified or overwritten by government data.
   - **Government Mandi Reference Price:** Sourced from the official OGD API / AGMARKNET feed as a benchmark for comparison.
3. **Dual Units & Explicit Conversion:**
   - Government data is natively reported in **₹/quintal** (1 quintal = 100 kg).
   - AgroBridge provides both original ₹/quintal and normalized **₹/kg** using the exact formula:
     $$\text{₹/kg} = \frac{\text{₹/quintal}}{100}$$
4. **Backend Security & Key Protection:**
   - API keys are read exclusively on the Node.js Express server (`process.env.OGD_API_KEY`).
   - The key is **NEVER exposed** in frontend builds, client HTTP requests, logs, or error responses.
   - Status endpoints return a masked indicator (`***KEY_CONFIGURED_ON_SERVER***`).

---

## 3. Environment Configurations

All configurations are defined in `server/.env` (documented in `server/.env.example`):

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `OGD_API_KEY` | Optional in dev / Req in prod | `""` (reads local cache in dev) | API Key obtained from data.gov.in |
| `OGD_RESOURCE_ID` | Optional | `9ef84268-d588-465a-a308-a864a43d0070` | OGD Resource UUID for daily mandi prices |
| `OGD_API_BASE_URL` | Optional | `https://api.data.gov.in/resource` | Government API gateway endpoint |
| `MANDI_PRICE_CACHE_TTL` | Optional | `900` | In-memory cache TTL in seconds (15 minutes) |

---

## 4. API Endpoints Reference

### 4.1 Filterable Mandi Prices
**`GET /api/market-prices`**

Retrieves normalized agricultural market price data with multi-parameter filtering, pagination, and cache metadata.

#### Query Parameters:
- `commodity` (string, optional): e.g., `Tomato`, `Potato`, `Wheat`, or Hindi synonyms `Tamatar`, `Aloo`.
- `state` (string, optional): e.g., `Madhya Pradesh`, `Maharashtra`, `Punjab`.
- `district` (string, optional): e.g., `Bhopal`, `Sehore`, `Pune`.
- `market` (string, optional): e.g., `Bhopal`, `Karad`, `Khanna`.
- `variety` (string, optional): e.g., `Hybrid`, `Deshi`, `Lokwan`.
- `grade` (string, optional): e.g., `FAQ`.
- `date` (string, optional): e.g., `18/09/2026`.
- `limit` (number, optional, default: 20, max: 100): Number of records per page.
- `offset` (number, optional, default: 0): Pagination offset.

#### Example Request:
```http
GET /api/market-prices?commodity=Tomato&state=Madhya%20Pradesh&limit=10
```

#### Normalized Response Format:
```json
{
  "success": true,
  "source": {
    "name": "Government of India Open Government Data Platform",
    "dataset": "Current Daily Price of Various Commodities from Various Markets (Mandi)",
    "isLive": true,
    "sourceUrl": "https://data.gov.in/"
  },
  "filters": {
    "commodity": "Tomato",
    "state": "Madhya Pradesh",
    "district": null,
    "market": null,
    "variety": null,
    "grade": null,
    "date": null
  },
  "lastUpdated": "2026-09-18",
  "totalRecords": 1,
  "limit": 10,
  "offset": 0,
  "records": [
    {
      "commodity": "Tomato",
      "variety": "Hybrid",
      "grade": "FAQ",
      "state": "Madhya Pradesh",
      "district": "Bhopal",
      "market": "Bhopal",
      "arrivalDate": "18/09/2026",
      "minimumPrice": 2800,
      "maximumPrice": 3600,
      "modalPrice": 3200,
      "priceUnit": "₹/quintal",
      "modalPricePerKg": 32,
      "minPricePerKg": 28,
      "maxPricePerKg": 36,
      "unitConversion": "₹/kg = ₹/quintal ÷ 100",
      "source": "Government of India OGD Platform",
      "sourceDataset": "Current Daily Price of Various Commodities from Various Markets (Mandi)",
      "resourceId": "9ef84268-d588-465a-a308-a864a43d0070",
      "isGovernmentData": true
    }
  ],
  "cache": {
    "used": true,
    "fetchedAt": "2026-09-18T06:45:00.000Z",
    "sourceDate": "18/09/2026",
    "isStale": false,
    "note": null
  },
  "error": null
}
```

---

### 4.2 Dropdown Filter Options
**`GET /api/market-prices/filters`**

Returns sorted arrays of unique commodities, states, districts, and markets present in the current government mandi catalog for dynamic UI cascading selectors.

#### Response:
```json
{
  "success": true,
  "data": {
    "commodities": ["Apple", "Cucumber", "Garlic", "Onion", "Potato", "Rice", "Soyabean", "Tomato", "Wheat"],
    "states": ["Himachal Pradesh", "Madhya Pradesh", "Maharashtra", "Punjab", "Uttar Pradesh"],
    "districts": ["Agra", "Bhopal", "Indore", "Khanna", "Nashik", "Pune", "Sehore", "Shimla"],
    "markets": ["Agra", "Bhopal", "Indore", "Karad", "Khanna", "Lasalgaon", "Pune", "Sehore", "Shimla"]
  }
}
```

---

### 4.3 Service Status & Masked Health
**`GET /api/market-prices/status`**

Reports dataset details, cache count, TTL, and masked key configuration.

#### Response:
```json
{
  "success": true,
  "data": {
    "service": "AgroBridge Government Mandi Price Service",
    "provider": "Government of India Open Government Data Platform (data.gov.in / AGMARKNET)",
    "dataset": "Current Daily Price of Various Commodities from Various Markets (Mandi)",
    "resourceId": "9ef84268-d588-465a-a308-a864a43d0070",
    "apiBaseUrl": "https://api.data.gov.in/resource",
    "apiKeyConfigured": true,
    "apiKeyMasked": "***KEY_CONFIGURED_ON_SERVER***",
    "cachedRecordsCount": 24,
    "lastSync": "2026-09-18T06:45:00.000Z",
    "cacheTtlSeconds": 900,
    "supportedCommodities": ["Tomato", "Potato", "Onion", "Wheat", "Cucumber", "Apple", "Soyabean", "Garlic", "Rice", "Gram", "Mustard"]
  }
}
```

---

### 4.4 On-Demand Cache Refresh
**`POST /api/market-prices/refresh`**

Triggers a synchronization request to the OGD platform. Requires `OGD_API_KEY` to be configured on the server.

---

### 4.5 Backward Compatibility Routes
- `GET /api/mandi/prices`: Preserved for legacy components and widgets.
- `GET /api/mandi/commodity/:name`: Preserved for quick commodity benchmark lookup.
- `GET /api/mandi/status`: Preserved for backward compatibility.

---

## 5. Caching Architecture & Stale Data Handling

1. **Two-Tier Cache Strategy:**
   - **Level 1 (Memory):** In-memory `Map` keyed deterministically by query parameters (`mandi:{commodity}_{state}_{district}_{market}_{variety}_{grade}_{date}`). TTL defaults to 900 seconds (15 minutes).
   - **Level 2 (Persistent Disk):** `server/data/gov_mandi_cache.json` stores the baseline snapshot across server restarts.
2. **Staleness Tracking:**
   - `cache.isStale`: `true` if `(now - lastSync) > MANDI_PRICE_CACHE_TTL`.
   - `cache.note`: Notifies the user: `"Latest available government data may be outdated."`
3. **Graceful Degradation:**
   - If the remote OGD API times out (7s abort controller) or returns a 5xx error, the service automatically falls back to the latest persistent snapshot and marks `cache.isStale = true` with a descriptive note.

---

## 6. Standalone Database Model: `MarketPriceSnapshot`

Located at `server/models/MarketPriceSnapshot.js`.

- Stores daily government mandi records independently.
- Contains compound indexes on `{ commodity: 1, state: 1, market: 1, arrivalDate: -1 }`.
- **Strict Isolation:** Completely isolated from the `products` collection. Farmers' listed prices (`product.price_per_kg`) are never overwritten.

---

## 7. Frontend Integration & Dual-Labeling

Located in `client/src/components/SmartPriceComparisonContent.jsx`:

1. **Interactive Explorer:**
   - Dropdown selectors for Commodity, State, District, and Market.
   - Live loading spinners, empty filter states, and error alerts.
2. **Dual Labeling Display:**
   - `Farmer’s Listed Price (AgroBridge Database)`: Displays ₹/kg directly from producer.
   - `Government Mandi Reference Price (data.gov.in OGD Platform)`: Displays official APMC Mandi rate in both ₹/quintal and ₹/kg.
3. **Price Difference Calculation:**
   - Sourced only when genuine comparable mandi rates exist:
     $$\text{Savings / Difference} = \text{Mandi Modal Price (₹/kg)} - \text{Farmer Price (₹/kg)}$$
   - Uses neutral, objective wording: *"Direct Farmer Price vs APMC Mandi Benchmark"*.
   - If no government mandi data exists for a crop, the card displays:
     `"Government mandi price data is currently unavailable for this crop."`

---

## 8. Limitations & Operational Notes

1. **APMC Reporting Frequency:** Mandis report arrival data during business hours on trading days. Reports may not be available on APMC holidays, Sundays, or before morning auction closures.
2. **Regional Coverage:** The OGD platform publishes data for mandis that actively participate in the National Agriculture Market (e-NAM) or Agmarknet daily upload portal.
3. **Unit Consistency:** All government prices are normalized to ₹/quintal; AgroBridge systematically applies `÷ 100` to convert to ₹/kg for consumer readability.
