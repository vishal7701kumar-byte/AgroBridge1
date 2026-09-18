"""
AgroBridge AI Feature Engineering Module
Constructs time-series lag features, rolling momentum, and seasonality harmonics.
"""

from typing import List, Dict, Any, Tuple
import math
import numpy as np

def extract_time_series_features(records: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Transforms chronological mandi records into feature matrix X and target y.
    Features:
    - Lag 1 (t-1)
    - Lag 2 (t-2)
    - Lag 3 (t-3)
    - Lag 7 (t-7, weekly seasonality)
    - 7-day rolling mean
    - 7-day rolling std (volatility)
    - Trend slope over past 5 observations
    - Day-of-year cyclical harmonic (sin, cos)
    """
    prices = [r["modalPricePerKg"] for r in records if r.get("modalPricePerKg") is not None]
    n = len(prices)

    if n < 4:
        return np.array([]), np.array([]), {"error": "Insufficient observations for feature matrix"}

    X_list = []
    y_list = []

    # Use adaptive lag window depending on available data length
    min_history = min(7, n - 1)

    for i in range(min_history, n):
        target = prices[i]

        lag1 = prices[i - 1]
        lag2 = prices[i - 2] if i >= 2 else lag1
        lag3 = prices[i - 3] if i >= 3 else lag2
        lag7 = prices[i - 7] if i >= 7 else prices[0]

        # Rolling window statistics
        window = prices[max(0, i - 7):i]
        roll_mean = float(np.mean(window))
        roll_std = float(np.std(window)) if len(window) > 1 else 0.5

        # Short-term momentum
        slope = (lag1 - window[0]) / max(1, len(window) - 1)

        # Harmonic seasonality proxy
        day_index = i % 365
        sin_season = math.sin(2 * math.pi * day_index / 365.0)
        cos_season = math.cos(2 * math.pi * day_index / 365.0)

        features = [lag1, lag2, lag3, lag7, roll_mean, roll_std, slope, sin_season, cos_season]
        X_list.append(features)
        y_list.append(target)

    return np.array(X_list), np.array(y_list), {
        "n_samples": len(y_list),
        "feature_names": ["lag1", "lag2", "lag3", "lag7", "roll_mean", "roll_std", "slope", "sin_season", "cos_season"]
    }
