"""
AgroBridge Price Forecast Handler
Formats the AI Price Advisory with strict 3-way price separation.
"""

from typing import List, Dict, Any, Optional
from models.price_model import AgriculturalPriceForecaster

def generate_price_advisory(
    commodity: str,
    market: str,
    mandi_records: List[Dict[str, Any]],
    farmer_listing_price: Optional[float] = None,
    horizon_days: int = 7
) -> Dict[str, Any]:
    forecaster = AgriculturalPriceForecaster()
    fit_result = forecaster.fit_and_validate(mandi_records)

    if not fit_result.get("success"):
        return {
            "success": False,
            "commodity": commodity,
            "market": market,
            "error": fit_result.get("error", "Not enough historical data to generate a reliable forecast."),
            "sampleCount": fit_result.get("sampleCount", 0),
            "recommendation": "Monitor daily APMC mandi updates as new arrival records are published."
        }

    forecast = forecaster.predict_horizon(horizon_days=horizon_days)

    current_market_ref = forecast["currentMarketReferencePerKg"]
    predicted_min = forecast["forecastRangePerKg"]["min"]
    predicted_max = forecast["forecastRangePerKg"]["max"]

    # Compare against Farmer's Listing Price if supplied
    farmer_price_insight = None
    farmer_price_status = None

    if farmer_listing_price is not None and farmer_listing_price > 0:
        if predicted_min <= farmer_listing_price <= predicted_max:
            farmer_price_insight = "Your current listing price is within the model's estimated reference range."
            farmer_price_status = "WITHIN_RANGE"
        elif farmer_listing_price > predicted_max:
            diff = round(farmer_listing_price - predicted_max, 1)
            farmer_price_insight = f"Your current price is above the recent market reference range by ₹{diff}/kg."
            farmer_price_status = "ABOVE_RANGE"
        else:
            diff = round(predicted_min - farmer_listing_price, 1)
            farmer_price_insight = f"Your current price is below the recent market reference range by ₹{diff}/kg."
            farmer_price_status = "BELOW_RANGE"
    else:
        farmer_price_insight = "Enter your desired listing price to compare it against the estimated market reference range."
        farmer_price_status = "NOT_SET"

    # Transparent Financial Realization Math
    effective_farmer_price = farmer_listing_price if (farmer_listing_price is not None and farmer_listing_price > 0) else round(current_market_ref * 1.18, 1)
    target_quantity_kg = 500
    mandi_gross = int(round(current_market_ref * target_quantity_kg))
    farmer_gross = int(round(effective_farmer_price * target_quantity_kg))
    gross_diff = farmer_gross - mandi_gross
    comm_savings = int(round(mandi_gross * 0.07)) # ~7% APMC middleman cut saved
    total_realization = gross_diff + comm_savings
    pct_bonus = int(round(((effective_farmer_price - current_market_ref) / current_market_ref) * 100))

    return {
        "success": True,
        "commodity": commodity,
        "market": market,
        "horizonDays": horizon_days,
        "quantityKg": target_quantity_kg,
        "mandiBenchmarkRate": current_market_ref,
        "recommendedDirectRate": effective_farmer_price,
        "extraEarningsPerKg": round(effective_farmer_price - current_market_ref, 1),
        "percentageBonus": f"{'+' if pct_bonus >= 0 else ''}{pct_bonus}%",
        "totalExtraEarnings": total_realization,
        "currentMarketReference": {
            "pricePerKg": current_market_ref,
            "priceQuintal": int(current_market_ref * 100),
            "label": "Government Mandi Modal Price",
            "source": "Government of India / AGMARKNET (data.gov.in)",
            "dataDate": mandi_records[-1].get("date", "Latest Available") if mandi_records else "Latest Available"
        },
        "aiForecast": {
            "rangePerKg": f"₹{int(predicted_min)}–₹{int(predicted_max)}/kg",
            "minPerKg": predicted_min,
            "maxPerKg": predicted_max,
            "expectedTrend": forecast["expectedTrend"],
            "expectedTrendSymbol": forecast["expectedTrendSymbol"],
            "expectedTrendLabel": forecast["expectedTrendLabel"],
            "forecastReliability": forecast["forecastReliability"],
            "reliabilityReason": forecast["reliabilityReason"]
        },
        "farmerListingPrice": {
            "pricePerKg": farmer_listing_price,
            "effectivePricePerKg": effective_farmer_price,
            "label": "Your Current Price (Set by Farmer)",
            "status": farmer_price_status,
            "aiInsight": farmer_price_insight,
            "farmerAutonomyNote": "The farmer always decides the final selling price. AI provides reference advisory only."
        },
        "additionalRealization": {
            "quantityKg": target_quantity_kg,
            "mandiGrossRevenue": mandi_gross,
            "farmerGrossRevenue": farmer_gross,
            "grossDirectDifference": gross_diff,
            "commissionSaved": comm_savings,
            "commissionRatePct": 7,
            "totalEstimatedAdditionalRealization": total_realization,
            "formulaExplanation": f"(Farmer Listing Price [₹{effective_farmer_price}] - Mandi Benchmark [₹{current_market_ref}]) × {target_quantity_kg} kg + 7% APMC Middleman Brokerage Saved",
            "disclaimer": "Estimated Additional Realization represents the gross financial difference compared to the local APMC benchmark rate, plus middleman commission savings. It does not account for farm-level production or harvest costs."
        },
        "dailyForecasts": forecast.get("dailyForecasts", []),
        "validationMetrics": forecast.get("validation", {}),
        "disclaimer": "AI Price Advisory provides statistical decision support based on historical government records. Future prices cannot be guaranteed."
    }
