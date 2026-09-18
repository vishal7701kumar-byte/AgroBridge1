"""
AgroBridge Python AI Microservice (FastAPI)
Exposes endpoints for AI Demand Forecasting, Price Advisory, and Market Insights.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from forecasting.price_forecast import generate_price_advisory
from forecasting.demand_forecast import generate_demand_forecast

app = FastAPI(
    title="AgroBridge Agricultural AI Decision Support Service",
    description="Time-series demand and price forecasting microservice based on Government of India Mandi Data.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class MandiRecord(BaseModel):
    commodity: Optional[str] = None
    market: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    arrivalDate: Optional[str] = None
    arrival_date: Optional[str] = None
    min_price: Optional[Any] = None
    max_price: Optional[Any] = None
    modal_price: Optional[Any] = None
    minimumPrice: Optional[Any] = None
    maximumPrice: Optional[Any] = None
    modalPrice: Optional[Any] = None
    modalPricePerKg: Optional[Any] = None
    arrivalsInQtl: Optional[Any] = None
    variety: Optional[str] = "FAQ"
    grade: Optional[str] = "FAQ"

class PricePredictRequest(BaseModel):
    commodity: str = Field(..., example="Tomato")
    market: str = Field(..., example="Bhopal")
    mandiRecords: List[Dict[str, Any]] = Field(default_factory=list)
    farmerListingPrice: Optional[float] = Field(None, example=28.0)
    forecastDays: Optional[int] = Field(7, example=7)

class DemandPredictRequest(BaseModel):
    commodity: str = Field(..., example="Tomato")
    market: str = Field(..., example="Bhopal")
    mandiRecords: List[Dict[str, Any]] = Field(default_factory=list)
    internalOrders: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    forecastDays: Optional[int] = Field(7, example=7)

class MarketInsightRequest(BaseModel):
    commodity: str = Field(..., example="Tomato")
    market: str = Field(..., example="Bhopal")
    mandiRecords: List[Dict[str, Any]] = Field(default_factory=list)
    internalOrders: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    farmerListingPrice: Optional[float] = Field(None, example=28.0)

# Endpoints
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AgroBridge Python AI Service",
        "models": ["RidgeTimePeriodRegressor", "AgriculturalDemandForecaster"],
        "version": "1.0.0"
    }

@app.get("/model-status")
def model_status():
    return {
        "status": "operational",
        "service": "AgroBridge Python AI Microservice",
        "modelVersion": "v1.2.0-ridge-timeseries",
        "algorithm": "Ridge Autoregression with Seasonal Lags & Naive Baseline Benchmark",
        "baselineModel": "Seasonal Naive (t-1 lag)",
        "features": ["lag1", "lag2", "lag3", "lag7", "roll_mean_7d", "roll_std_7d", "momentum_slope", "annual_harmonic"],
        "dataProvenance": "Government of India AGMARKNET / data.gov.in (Resource 9ef84268-d588-465a-a308-a864a43d0070)",
        "unitGuarantee": "₹/kg = ₹/quintal ÷ 100",
        "honestyPolicy": "No price guarantees; zero hallucinated confidence scores"
    }

@app.post("/predict/price")
def predict_price(req: PricePredictRequest):
    try:
        advisory = generate_price_advisory(
            commodity=req.commodity,
            market=req.market,
            mandi_records=req.mandiRecords,
            farmer_listing_price=req.farmerListingPrice,
            horizon_days=req.forecastDays or 7
        )
        return advisory
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price forecast failed: {str(e)}")

@app.post("/predict/demand")
def predict_demand(req: DemandPredictRequest):
    try:
        forecast = generate_demand_forecast(
            commodity=req.commodity,
            market=req.market,
            mandi_records=req.mandiRecords,
            internal_orders=req.internalOrders,
            forecast_days=req.forecastDays or 7
        )
        return forecast
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Demand forecast failed: {str(e)}")

@app.post("/market-insight")
def combined_market_insight(req: MarketInsightRequest):
    try:
        demand = generate_demand_forecast(
            commodity=req.commodity,
            market=req.market,
            mandi_records=req.mandiRecords,
            internal_orders=req.internalOrders,
            forecast_days=7
        )
        price_adv = generate_price_advisory(
            commodity=req.commodity,
            market=req.market,
            mandi_records=req.mandiRecords,
            farmer_listing_price=req.farmerListingPrice,
            horizon_days=7
        )

        demand_trend = demand.get("trend", "Stable")
        price_trend = price_adv.get("aiForecast", {}).get("expectedTrend", "Stable")

        # Synthesis
        if demand_trend == "Increasing" and price_trend == "Increasing":
            insight_text = (
                f"Demand and recent market prices for {req.commodity} are both showing an upward trend. "
                "Consider monitoring market conditions before deciding your final selling price."
            )
            market_activity = "High Commercial Interest"
        elif demand_trend == "Decreasing" and price_trend == "Decreasing":
            insight_text = (
                f"Demand and recent prices for {req.commodity} are showing a declining trend. "
                "Consider reviewing your available quantity, harvesting timing, and active buyer orders."
            )
            market_activity = "Elevated Market Supply"
        elif demand_trend == "Increasing" and price_trend in ["Stable", "Decreasing"]:
            insight_text = (
                f"Demand is rising while wholesale prices remain competitive for {req.commodity}. "
                "Direct farm-gate listing provides strong value over intermediate commission agents."
            )
            market_activity = "Active Turnover"
        else:
            insight_text = (
                f"Market conditions for {req.commodity} are operating within normal seasonal boundaries. "
                "Maintaining competitive pricing ensures steady order fulfillment."
            )
            market_activity = "Moderate"

        return {
            "success": True,
            "commodity": req.commodity,
            "market": req.market,
            "demand": {
                "level": demand.get("demandLevel", "STEADY DEMAND"),
                "trend": demand_trend,
                "trendSymbol": demand.get("trendSymbol", "→")
            },
            "price": {
                "trend": price_trend,
                "trendSymbol": price_adv.get("aiForecast", {}).get("expectedTrendSymbol", "→"),
                "forecastRange": price_adv.get("aiForecast", {}).get("rangePerKg", "N/A"),
                "referencePrice": price_adv.get("currentMarketReference", {}).get("pricePerKg")
            },
            "marketActivity": market_activity,
            "aiInsight": insight_text,
            "farmerListingPrice": req.farmerListingPrice,
            "disclaimer": "AI Market Insight provides decision support and does not constitute a financial guarantee."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market insight synthesis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
