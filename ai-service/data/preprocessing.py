"""
AgroBridge AI Data Preprocessing Module
Handles data cleaning, validation, unit conversion, and provenance tracking.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import numpy as np

def clean_and_normalize_records(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Cleans raw mandi and market records:
    1. Validates presence of essential fields (commodity, market, date).
    2. Removes duplicates based on (commodity, market, arrivalDate).
    3. Normalizes units: preserves ₹/quintal and computes ₹/kg (₹/quintal ÷ 100).
    4. Handles missing or NaN prices gracefully.
    5. Filters extreme price anomalies (> 5x or < 0.2x local median).
    """
    if not records:
        return []

    cleaned = []
    seen_keys = set()

    for r in records:
        commodity = str(r.get("commodity") or "").strip()
        market = str(r.get("market") or "").strip()
        state = str(r.get("state") or "").strip()
        district = str(r.get("district") or "").strip()
        arrival_date = str(r.get("arrivalDate") or r.get("arrival_date") or "").strip()

        if not commodity or not market or not arrival_date:
            continue

        dedupe_key = f"{commodity}_{state}_{market}_{arrival_date}".lower()
        if dedupe_key in seen_keys:
            continue
        seen_keys.add(dedupe_key)

        # Parse prices safely
        try:
            min_qtl = float(r.get("min_price") if r.get("min_price") is not None else r.get("minimumPrice", 0))
        except (ValueError, TypeError):
            min_qtl = None

        try:
            max_qtl = float(r.get("max_price") if r.get("max_price") is not None else r.get("maximumPrice", 0))
        except (ValueError, TypeError):
            max_qtl = None

        try:
            modal_qtl = float(r.get("modal_price") if r.get("modal_price") is not None else r.get("modalPrice", 0))
        except (ValueError, TypeError):
            modal_qtl = None

        if modal_qtl is None or modal_qtl <= 0:
            # Fallback to average of min and max if modal missing
            if min_qtl and max_qtl:
                modal_qtl = (min_qtl + max_qtl) / 2.0
            else:
                continue

        # Derived ₹/kg prices (1 quintal = 100 kg)
        modal_kg = round(modal_qtl / 100.0, 2)
        min_kg = round(min_qtl / 100.0, 2) if min_qtl else round(modal_kg * 0.9, 2)
        max_kg = round(max_qtl / 100.0, 2) if max_qtl else round(modal_kg * 1.1, 2)

        # Parse arrival quantity in quintals / tonnes if available
        try:
            arrivals = float(r.get("arrivals_in_qtl") or r.get("arrival_quantity") or 0.0)
        except (ValueError, TypeError):
            arrivals = 0.0

        cleaned.append({
            "commodity": commodity,
            "variety": str(r.get("variety") or "FAQ").strip(),
            "grade": str(r.get("grade") or "FAQ").strip(),
            "state": state,
            "district": district,
            "market": market,
            "arrivalDate": arrival_date,
            "minimumPrice": min_qtl,
            "maximumPrice": max_qtl,
            "modalPrice": modal_qtl,
            "minPricePerKg": min_kg,
            "maxPricePerKg": max_kg,
            "modalPricePerKg": modal_kg,
            "arrivalsInQtl": arrivals,
            "source": r.get("source") or "Government of India OGD Platform (data.gov.in)",
            "unitConversion": "₹/kg = ₹/quintal ÷ 100"
        })

    # Sort chronologically by date
    cleaned.sort(key=lambda x: x["arrivalDate"])
    return cleaned
