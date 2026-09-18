"""
AgroBridge Demand Forecast Handler
Formats the AI Demand Forecast for farmer presentation.
"""

from typing import List, Dict, Any, Optional
from models.demand_model import AgriculturalDemandForecaster

def generate_demand_forecast(
    commodity: str,
    market: str,
    mandi_records: List[Dict[str, Any]],
    internal_orders: Optional[List[Dict[str, Any]]] = None,
    forecast_days: int = 7
) -> Dict[str, Any]:
    forecaster = AgriculturalDemandForecaster()
    return forecaster.forecast_demand(
        commodity=commodity,
        market=market,
        mandi_records=mandi_records,
        internal_orders=internal_orders,
        forecast_days=forecast_days
    )
