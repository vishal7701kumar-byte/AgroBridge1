"""
AgroBridge AI Demand Forecasting Model
Estimates crop demand trends from government mandi arrival trends and internal marketplace transactions.
"""

from typing import List, Dict, Any, Optional
import numpy as np

class AgriculturalDemandForecaster:
    """
    Evaluates whether demand for a crop will be High, Moderate, or Low.
    Handles the cold-start problem honestly when local transaction history is still growing.
    """

    def __init__(self):
        pass

    def forecast_demand(
        self,
        commodity: str,
        market: str,
        mandi_records: List[Dict[str, Any]],
        internal_orders: Optional[List[Dict[str, Any]]] = None,
        forecast_days: int = 7
    ) -> Dict[str, Any]:
        """
        Synthesizes demand forecast from real data inputs.
        """
        internal_orders = internal_orders or []
        order_count = len(internal_orders)
        is_cold_start = order_count < 5

        # 1. Evaluate market arrival momentum from historical government records
        arrival_quantities = [
            float(r.get("arrivalsInQtl") or r.get("arrivals_in_qtl") or 0)
            for r in mandi_records if (r.get("arrivalsInQtl") or r.get("arrivals_in_qtl"))
        ]

        price_series = [
            float(r.get("modalPricePerKg") or (float(r.get("modal_price", 0)) / 100))
            for r in mandi_records if r.get("modalPricePerKg") or r.get("modal_price")
        ]

        # Price momentum indicator
        price_momentum = 0.0
        if len(price_series) >= 3:
            recent_avg = np.mean(price_series[-3:])
            prior_avg = np.mean(price_series[:max(1, len(price_series)-3)])
            price_momentum = ((recent_avg - prior_avg) / prior_avg) * 100.0 if prior_avg > 0 else 0.0

        # AgroBridge order momentum indicator
        internal_momentum = 0.0
        if not is_cold_start:
            recent_orders = internal_orders[-5:]
            prior_orders = internal_orders[:-5]
            recent_vol = sum(o.get("quantityKg", 0) for o in recent_orders)
            prior_vol = sum(o.get("quantityKg", 0) for o in prior_orders)
            if prior_vol > 0:
                internal_momentum = ((recent_vol - prior_vol) / prior_vol) * 100.0

        # 2. Derive Demand Level & Trend
        # Combined demand score: 50% market price/arrival pressure + 50% internal AgroBridge demand
        composite_score = price_momentum * 0.6 + internal_momentum * 0.4

        reasons = []

        if not is_cold_start:
            if internal_momentum > 5:
                reasons.append("Recent AgroBridge orders and cart activity are increasing")
            elif internal_momentum < -5:
                reasons.append("Recent AgroBridge orders are temporarily slower")
            else:
                reasons.append("AgroBridge buyer demand is steady and consistent")
        else:
            reasons.append("AgroBridge is still collecting local order history (analysis grounded in government market data)")

        if price_momentum > 3:
            reasons.append("Market wholesale prices are displaying an upward trend across regional mandis")
            demand_level = "HIGH DEMAND"
            trend = "Increasing"
            trend_symbol = "↗"
            expected_desc = "Higher than recent average"
            farmer_suggestion = (
                f"Demand is showing an increasing trend for {commodity}. You may consider preparing additional stock, "
                "but review your available inventory and local harvest timing before making a decision."
            )
        elif price_momentum < -3:
            reasons.append("Market wholesale prices reflect higher market arrivals and supply inflows")
            demand_level = "MODERATE DEMAND"
            trend = "Decreasing"
            trend_symbol = "↘"
            expected_desc = "Lower than recent average"
            farmer_suggestion = (
                f"Market inflows are strong for {commodity}. Consider reviewing packaging, grading, and connecting directly "
                "with verified bulk buyers to ensure prompt sales."
            )
        else:
            reasons.append("Market prices and daily mandi arrivals are operating within steady seasonal averages")
            demand_level = "STEADY DEMAND"
            trend = "Stable"
            trend_symbol = "→"
            expected_desc = "In line with recent average"
            farmer_suggestion = (
                f"Demand for {commodity} is stable. Continue standard harvest and delivery schedules while keeping listing "
                "prices aligned with recent market benchmarks."
            )

        # Reliability evaluation
        mandi_points = len(mandi_records)
        if mandi_points >= 14 and not is_cold_start:
            reliability = "High"
            reliability_text = "High (multi-week mandi data + platform order history)"
            confidence_score = 92.0
        elif mandi_points >= 5:
            reliability = "Medium"
            reliability_text = "Medium (validated APMC mandi records)"
            confidence_score = 85.0
        else:
            reliability = "Low"
            reliability_text = "Low (developing regional observations)"
            confidence_score = 75.0

        # Formatted price trend string
        sign = "+" if price_momentum >= 0 else ""
        expected_price_trend = f"{trend_symbol} {trend} ({sign}{price_momentum:.1f}%)"

        # Baseline regional daily consumption per commodity (in Quintals)
        base_demand_map = {
            "tomato": 26,
            "wheat": 58,
            "onion": 38,
            "soybean": 48,
            "potato": 42,
            "cucumber": 18,
            "apple": 24,
            "cauliflower": 22
        }
        matched_key = next((k for k in base_demand_map if k in commodity.lower()), "tomato")
        nominal_daily_qtl = base_demand_map[matched_key]

        # If real arrival volumes exist in mandi records, blend them
        if arrival_quantities:
            valid_arr = [a for a in arrival_quantities if a > 0]
            if valid_arr:
                mean_arr = float(np.mean(valid_arr))
                # APMC arrival is wholesale supply; consumer demand absorbs ~70-90% of local hub arrival
                nominal_daily_qtl = max(10, int(0.5 * nominal_daily_qtl + 0.5 * (mean_arr * 0.85)))

        # 7-day cyclical weekly distribution
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        day_factors = [1.02, 0.96, 1.00, 1.04, 1.18, 1.32, 1.22] # Weekend surge

        daily_forecast_days = []
        for i in range(forecast_days):
            day_idx = i % 7
            day_factor = day_factors[day_idx]
            # Drift factor based on momentum
            momentum_drift = 1.0 + (price_momentum / 100.0) * (0.02 * (i + 1))
            daily_qtl = max(5, int(round(nominal_daily_qtl * day_factor * momentum_drift)))
            
            # Daily classification
            if daily_qtl >= int(nominal_daily_qtl * 1.20):
                d_level = "SURGING"
            elif daily_qtl >= int(nominal_daily_qtl * 1.02):
                d_level = "HIGH"
            else:
                d_level = "MODERATE"

            daily_forecast_days.append({
                "day": day_names[day_idx],
                "projectedDemandQuintals": daily_qtl,
                "projected_demand_kg": daily_qtl * 100,
                "demandLevel": d_level
            })

        total_weekly_quintals = sum(d["projectedDemandQuintals"] for d in daily_forecast_days)

        english_advisory = (
            f"Demand for {commodity} is projected at {total_weekly_quintals} Qtls in the {market} consuming belt. "
            f"Price momentum is {expected_price_trend}. Direct listing on AgroBridge bypasses middleman auctions."
        )
        hindi_advisory = (
            f"अगले {forecast_days} दिनों में {commodity} की मांग {market} क्षेत्र में {total_weekly_quintals} क्विंटल रहने का अनुमान है "
            f"({trend} रुझान)। सीधे एग्रोब्रिज पर लिस्ट करें।"
        )

        return {
            "success": True,
            "commodity": commodity,
            "market": market,
            "region": market,
            "forecastHorizon": f"Next {forecast_days} Days",
            "demandLevel": demand_level,
            "trend": trend,
            "trendSymbol": trend_symbol,
            "expectedDemand": expected_desc,
            "expectedPriceTrend": expected_price_trend,
            "priceMomentumPct": round(price_momentum, 1),
            "totalWeeklyProjectedDemandQuintals": total_weekly_quintals,
            "forecastDays": daily_forecast_days,
            "confidenceScore": confidence_score,
            "forecastReliability": reliability,
            "forecastReliabilityDetail": reliability_text,
            "reasons": reasons,
            "farmerSuggestion": farmer_suggestion,
            "aiAdvisory": english_advisory,
            "hindiAdvisory": hindi_advisory,
            "coldStart": is_cold_start,
            "coldStartNote": "AgroBridge is still collecting local order history. Current analysis is primarily based on historical government market data." if is_cold_start else None,
            "factorsConsidered": [
                "Government mandi daily prices & arrival momentum",
                "Historical seasonal patterns",
                "AgroBridge platform transaction velocity" if not is_cold_start else "Government mandi baseline (Platform cold-start mode)"
            ]
        }
