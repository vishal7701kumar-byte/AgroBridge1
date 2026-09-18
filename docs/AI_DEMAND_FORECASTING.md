# AgroBridge – AI Demand Forecasting Module

## 1. Overview & Decision Context
The **AI Demand Forecasting** module is designed to solve a foundational dilemma for smallholder Indian farmers:
> **"Future mein mere product ki demand kaisi ho sakti hai?"**  
> *(What is the anticipated demand outlook for my harvested produce in the upcoming market cycle?)*

Traditional agricultural trade leaves farmers blind to downstream inventory accumulation and wholesale arrivals, leading to distress sales during localized market gluts. AgroBridge synthesizes **authentic APMC daily market arrival volumes** from the Government of India's Open Government Data (OGD) platform with **local platform order velocity** to deliver explainable, reliable demand intelligence.

---

## 2. Authentic Data Ingestion & Grounding
AgroBridge adheres to a strict **Truth-in-Data** standard:
1. **Primary Grounding Source**:  
   - Source: Open Government Data (OGD) Platform India (`data.gov.in`) / AGMARKNET.
   - Resource Identifier: `9ef84268-d588-465a-a308-a864a43d0070` (*Current Daily Price and Arrival of Various Commodities from Various Markets*).
   - Frequency: Real-time API retrieval with persistent multi-day caching (`server/data/gov_mandi_cache.json`).
   - Fields utilized: `arrival_date`, `commodity`, `variety`, `market`, `modal_price` (₹/quintal), `arrivals_in_qtl` (daily arrivals in quintals).
2. **Local Platform Transaction Velocity**:  
   - Source: `server/data/orders.json` (AgroBridge verified escrow transactions).
   - Fields: `items.quantity_kg`, `order_status`, `created_at`, `buyer_role`.
3. **Cold-Start Handling**:  
   - When a newly listed crop or region has fewer than 20 platform orders, the system automatically engages **Cold-Start Fallback Mode**.
   - The UI transparently presents:
     > *"AgroBridge is still collecting local order history for this crop. Current analysis is primarily based on historical government market data."*
   - Demand calculations gracefully rely on regional APMC arrival trends, never hallucinating false internal transaction numbers.

---

## 3. Mathematical & Algorithmic Formulation

The demand engine runs in our Python FastAPI service (`ai-service/models/demand_model.py`) with complete parity in our resilient Node.js bridge (`server/services/aiForecastBridgeService.js`).

### A. Arrival Momentum Ratio ($M_{7,30}$)
We track the short-term 7-day rolling arrival mean against the broader 30-day baseline arrival rate at the target APMC mandi:
$$\bar{A}_{7} = \frac{1}{7}\sum_{k=0}^{6} \text{Arrival}_{t-k}, \quad \bar{A}_{30} = \frac{1}{30}\sum_{k=0}^{29} \text{Arrival}_{t-k}$$
$$M_{7,30} = \frac{\bar{A}_{7}}{\max(1.0, \bar{A}_{30})}$$

### B. Inverse Arrival Scarcity Pressure ($S_{arrival}$)
In agricultural commodities, falling APMC arrivals coupled with steady retail absorption create inventory scarcity, pushing demand indicators upward:
$$S_{arrival} = \text{clip}\left(1.0 - 0.5 \cdot (M_{7,30} - 1.0), 0.2, 1.8\right)$$

### C. Price Momentum Confirmation ($P_{momentum}$)
When commodity prices appreciate over a 7-day lag, it signals genuine market buying absorption rather than buyer resistance:
$$P_{momentum} = \frac{P_{t} - P_{t-7}}{P_{t-7}}$$

### D. Platform Buyer Order Velocity ($V_{order}$)
Internal buyer transaction frequency is computed as:
$$V_{order} = \min\left(2.0, \frac{\text{Recent Platform Orders (7d)}}{\text{Baseline Expected Orders}}\right)$$

### E. Composite Demand Score ($Score_{demand}$)
The composite score synthesizes market arrivals, price signals, and buyer demand:
$$Score_{demand} = w_1 \cdot S_{arrival} + w_2 \cdot (1 + P_{momentum}) + w_3 \cdot V_{order}$$
Where weights are dynamically assigned based on cold-start status:
- Standard Mode: $w_1 = 0.40, w_2 = 0.35, w_3 = 0.25$
- Cold-Start Mode: $w_1 = 0.55, w_2 = 0.45, w_3 = 0.00$

### F. Categorical Classification & Directional Arrow
- **High Demand (Score $\ge 1.15$)**: ↗ Increasing or ➔ Stable. High market clearance, strong buyer bids.
- **Moderate Demand ($0.85 \le \text{Score} < 1.15$)**: ➔ Stable. Market is balanced; typical seasonal absorption.
- **Low Demand (Score $< 0.85$)**: ↘ Decreasing. APMC glut or heavy surplus; buyer resistance.

---

## 4. Explainable AI ("Why?" Factor Breakdown)
To earn farmer trust, AgroBridge rejects black-box outputs. Every demand forecast returns clear, plain-language bullet points explaining the driving factors:
1. **APMC Arrival Trend**: e.g., *"Bhopal Mandi arrivals have decreased by 14.2% over the last 7 days, indicating reduced spot supply."*
2. **Price Action Confirmation**: e.g., *"Recent modal prices strengthened by +4.8%, confirming active market absorption."*
3. **Buyer Activity Velocity**: e.g., *"Local AgroBridge bulk buyers and consumers have placed 8 repeat orders in this cluster this week."*
4. **Seasonal Context**: e.g., *"Mid-season crop cycle with steady consumer grocery demand."*

---

## 5. Farmer-Centric Advisory & Action Suggestions
Guidance is structured around real-world farm harvest decisions:
- **When Demand is High**:
  > *"Consider dispatching freshly graded Grade A lots to capture favorable market realization, or stagger harvests across the next 3–5 days to maximize premium returns."*
- **When Demand is Moderate**:
  > *"Maintain competitive standard market pricing. Ensure quality packaging and clean sorting to achieve fast order clearance."*
- **When Demand is Low (Glut Risk)**:
  > *"Heavy mandi arrivals detected. Consider value-addition, short-term cold storage, or listing small bundles on AgroBridge direct-to-consumer to avoid distress liquidation."*

---

## 6. REST API Endpoint Specification

### `GET /api/ai/demand-forecast`
**Query Parameters:**
- `commodity` (string, required): e.g. `Tomato`
- `market` (string, optional): e.g. `Bhopal`
- `forecastDays` (number, default: `7`): Horizon days (`7`, `14`, or `30`)

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "commodity": "Tomato",
    "market": "Bhopal",
    "forecastHorizonDays": 7,
    "demandLevel": "High",
    "trendDirection": "Increasing",
    "trendArrow": "↗",
    "demandScore": 1.24,
    "confidenceLevel": "High",
    "isColdStart": false,
    "whyFactors": [
      "Bhopal APMC arrivals contracted by 12.4% over the past 7 days, signaling localized supply tightening.",
      "Modal market benchmark price rose from ₹24.50/kg to ₹26.80/kg (+9.4%), confirming healthy buyer absorption.",
      "AgroBridge regional buyer order velocity recorded 11 orders in the past 7 days."
    ],
    "actionSuggestion": "Demand conditions are favorable. Harvest mature Grade A fruit and list at standard market premium.",
    "dataSource": "AGMARKNET OGD Platform India (Resource 9ef84268) & AgroBridge Order Ledger",
    "modelMetadata": {
      "engine": "python_microservice",
      "algorithm": "APMC Arrival Momentum + Order Velocity Synthesis",
      "evaluatedAt": "2026-09-18T07:30:00.000Z"
    }
  }
}
```
