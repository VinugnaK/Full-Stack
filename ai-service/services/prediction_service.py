"""
Core prediction service.
Uses scikit-learn models when trained models are saved to disk (models/ directory).
Falls back to deterministic rule-based logic on first run before training.
"""
import joblib
import numpy as np
from pathlib import Path
from services.feature_engineering import build_overrun_features, build_burnout_features

MODEL_DIR = Path(__file__).parent.parent / "models"


def _load_model(name: str):
    path = MODEL_DIR / name
    if path.exists():
        return joblib.load(path)
    return None


def _risk_from_score(score: float) -> str:
    if score < 0.33:
        return "LOW"
    if score < 0.66:
        return "MEDIUM"
    return "HIGH"


def _overrun_suggestion(risk: str, data: dict) -> str:
    days = data.get("days_until_deadline", -1)
    hours = data.get("hours_until_deadline", -1)
    if data.get("status") == "done":
        return "This task is completed. Risk is low unless the scope changes."
    if risk == "HIGH":
        if hours >= 0 and hours <= 24:
            return "High overrun risk detected. Deadline is very close, so start immediately or reschedule."
        if days < 0:
            return "This task is already past its deadline. Escalate or reschedule immediately."
        return "High overrun risk detected. Consider breaking the task into smaller subtasks and starting immediately."
    if risk == "MEDIUM":
        return "Moderate risk. Review your current workload and allocate focused time blocks for this task."
    return "Task is on track. Keep up the current pace."


def _rule_based_overrun(features: np.ndarray) -> float:
    """
    Heuristic overrun probability when no trained model is available.
    Features order:
    0 priority, 1 progress_ratio, 2 days_norm, 3 hours_norm, 4 active_load,
    5 completion_rate, 6 overdue_rate, 7 avg_days, 8 remaining, 9 overdue_flag,
    10 hours_left_norm, 11 is_done, 12 is_in_progress
    """
    priority_score = features[0]
    progress_ratio = features[1]
    days_norm = features[2]
    hours_norm = features[3]
    active_load = features[4]
    completion_rate = features[5]
    overdue_rate = features[6]
    remaining = features[8]
    overdue_flag = features[9]
    hours_left_norm = features[10]
    is_done = features[11]
    is_in_progress = features[12]

    if is_done >= 1.0:
      return 0.08

    score = 0.06
    score += (priority_score / 2.0) * 0.14
    score += max(0.0, 1.0 - progress_ratio) * 0.16
    score += min(max(hours_norm, 0.0), 1.6) * 0.10
    score += min(max(active_load, 0.0), 2.5) * 0.08
    score += (1.0 - completion_rate) * 0.14
    score += min(max(overdue_rate, 0.0), 1.0) * 0.10
    score += min(max(remaining, 0.0), 1.0) * 0.10

    if overdue_flag > 0:
        score += 0.28
    else:
        if days_norm <= 0.04:
            score += 0.18
        elif days_norm <= 0.12:
            score += 0.11
        elif days_norm >= 0.35:
            score -= 0.08

        if hours_left_norm <= 0.05:
            score += 0.14
        elif hours_left_norm <= 0.12:
            score += 0.09

    if priority_score == 2 and progress_ratio < 0.25:
        score += 0.08
    if priority_score == 0 and progress_ratio >= 0.5 and days_norm >= 0.2:
        score -= 0.12
    if is_in_progress and progress_ratio >= 0.45 and days_norm >= 0.12:
        score -= 0.08
    if progress_ratio >= 0.85 and overdue_flag == 0:
        score -= 0.12

    return float(np.clip(score, 0.0, 1.0))


def predict_overrun(data: dict) -> dict:
    features = build_overrun_features(data).reshape(1, -1)
    model = _load_model("overrun_model.pkl")

    if data.get("status") == "done":
        score = 0.08
    elif model:
        try:
            score = float(model.predict_proba(features)[0][1])
        except Exception:
            score = _rule_based_overrun(features[0])
    else:
        score = _rule_based_overrun(features[0])

    risk = _risk_from_score(score)
    suggestion = _overrun_suggestion(risk, data)

    return {
        "risk_level": risk,
        "risk_score": round(score, 4),
        "probability": f"{round(score * 100, 1)}%",
        "suggestion": suggestion,
    }


def _rule_based_burnout(features: np.ndarray) -> float:
    score = 0.0
    score += (1.0 - features[0]) * 0.35
    score += features[1] * 0.30
    score += min(features[2], 1.0) * 0.20
    score += min(features[3], 1.0) * 0.15
    return float(np.clip(score, 0.0, 1.0))


def detect_burnout(data: dict) -> dict:
    features = build_burnout_features(data).reshape(1, -1)
    model = _load_model("burnout_model.pkl")

    if model:
        try:
            score = float(model.predict_proba(features)[0][1])
        except Exception:
            score = _rule_based_burnout(features[0])
    else:
        score = _rule_based_burnout(features[0])

    score_pct = round(score * 100)

    if score < 0.4:
        level = "LOW"
        suggestion = "Your workload looks healthy. Keep maintaining balance."
    elif score < 0.7:
        level = "MEDIUM"
        suggestion = "Signs of overload detected. Consider delegating tasks or taking short breaks."
    else:
        level = "HIGH"
        suggestion = "High burnout risk! Prioritise rest, reduce task count, and speak with your manager."

    return {"score": score_pct, "level": level, "suggestion": suggestion}


def get_productivity_score(history: list) -> dict:
    if not history:
        return {"score": 0, "chart": []}

    week_scores = []
    for i in range(0, len(history), 7):
        chunk = history[i:i + 7]
        total = sum(d.get("created", 0) for d in chunk)
        done = sum(d.get("completed", 0) for d in chunk)
        rate = done / total if total > 0 else 0
        score = round(rate * 100)
        label = f"Wk {i // 7 + 1}"
        week_scores.append({"week": label, "score": score})

    overall = round(np.mean([w["score"] for w in week_scores])) if week_scores else 0
    return {"score": overall, "chart": week_scores}
