"""
AgroBridge AI Model Validation Module
Evaluates model performance against naive and moving-average baselines using MAE, RMSE, and MAPE.
"""

from typing import Dict, Any, List
import numpy as np

def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Computes standard regression error metrics.
    """
    if len(y_true) == 0 or len(y_pred) == 0:
        return {"mae": 0.0, "rmse": 0.0, "mape": 0.0}

    mae = float(np.mean(np.abs(y_true - y_pred)))
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))

    # Prevent division by zero in MAPE
    non_zero = y_true != 0
    if np.any(non_zero):
        mape = float(np.mean(np.abs((y_true[non_zero] - y_pred[non_zero]) / y_true[non_zero])) * 100.0)
    else:
        mape = 0.0

    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mape": round(mape, 2)
    }

def evaluate_forecast_reliability(
    sample_count: int,
    mae: float,
    mean_price: float,
    baseline_improvement_pct: float
) -> Dict[str, Any]:
    """
    Objectively determines forecast reliability (High / Medium / Low).
    Never randomly guesses. Evaluates sample count and normalized error ratio.
    """
    if sample_count < 5:
        return {
            "reliability": "Low",
            "reason": "Limited historical market observations available (< 5 data points).",
            "isSufficient": False
        }

    relative_error = (mae / mean_price) if mean_price > 0 else 1.0

    if sample_count >= 20 and relative_error <= 0.12:
        reliability = "High"
        reason = "High statistical confidence: Consistent multi-week market history with low residual error (< 12%)."
    elif sample_count >= 8 and relative_error <= 0.22:
        reliability = "Medium"
        reason = "Moderate confidence: Stable recent market patterns with acceptable error bounds."
    else:
        reliability = "Low"
        reason = "Higher price volatility or developing regional trade volume."

    return {
        "reliability": reliability,
        "reason": reason,
        "isSufficient": True,
        "sampleCount": sample_count,
        "relativeErrorPct": round(relative_error * 100, 1),
        "baselineImprovementPct": round(baseline_improvement_pct, 1)
    }
