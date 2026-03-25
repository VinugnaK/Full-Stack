"""
Feature engineering for all AI models.
Converts raw task/user data into numeric feature vectors.
"""
import numpy as np

PRIORITY_MAP = {"low": 0, "medium": 1, "high": 2}


def build_overrun_features(data: dict) -> np.ndarray:
    """
    Features for overrun prediction model.
    Returns a 1D numpy array of shape (13,).
    """
    priority_score = PRIORITY_MAP.get(data.get("priority", "medium"), 1)
    completion_rate = (
        data["completed_tasks"] / data["total_tasks"]
        if data.get("total_tasks", 0) > 0 else 0.5
    )
    overdue_rate = (
        data["overdue_count"] / data["total_tasks"]
        if data.get("total_tasks", 0) > 0 else 0
    )

    progress_ratio = data.get("progress", 0) / 100.0
    days_left = max(float(data.get("days_until_deadline", -1)), -30)
    hours_left = max(float(data.get("hours_until_deadline", -1)), -720)
    hours_est = min(float(data.get("estimated_hours", 0) or 0), 200)
    active_load = min(float(data.get("active_tasks", 0) or 0), 50)
    avg_days = min(float(data.get("avg_completion_days", 0) or 0), 60)
    status = data.get("status", "todo")
    is_done = float(status == "done")
    is_in_progress = float(status == "in_progress")

    return np.array([
        priority_score,       # 0 task urgency
        progress_ratio,       # 1 completion ratio
        days_left / 30.0,     # 2 normalized days remaining
        hours_est / 40.0,     # 3 normalized effort
        active_load / 10.0,   # 4 workload pressure
        completion_rate,      # 5 historical reliability
        overdue_rate,         # 6 historical overdue rate
        avg_days / 14.0,      # 7 average time to complete
        1.0 - progress_ratio, # 8 remaining work
        float(days_left < 0), # 9 overdue flag
        hours_left / 72.0,    # 10 near-term deadline pressure
        is_done,              # 11 completed task
        is_in_progress,       # 12 started task
    ], dtype=np.float32)


def build_burnout_features(data: dict) -> np.ndarray:
    """Features for burnout detection model. Shape (4,)."""
    total = max(data.get("total", 1), 1)
    done = data.get("done", 0)
    overdue = data.get("overdue", 0)
    hours = min(data.get("avg_hours", 0), 80)

    completion_rate = done / total
    overdue_rate = overdue / total

    return np.array([
        completion_rate,
        overdue_rate,
        hours / 8.0,
        total / 20.0,
    ], dtype=np.float32)
