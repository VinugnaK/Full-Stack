from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.prediction_service import predict_overrun, detect_burnout, get_productivity_score

router = APIRouter()

# ── Overrun Prediction ────────────────────────────────────────────────────────
class OverrunInput(BaseModel):
    task_id: int
    user_id: int
    status: str = "todo"
    estimated_hours: float = 0
    priority: str = "medium"
    progress: float = 0
    days_until_deadline: float = -1
    hours_until_deadline: float = -1
    active_tasks: int = 0
    total_tasks: int = 0
    completed_tasks: int = 0
    avg_completion_days: float = 0
    overdue_count: int = 0

@router.post("/overrun")
def overrun(data: OverrunInput):
    return predict_overrun(data.dict())

# ── Burnout Detection ─────────────────────────────────────────────────────────
class BurnoutInput(BaseModel):
    user_id: int
    total: int = 0
    done: int = 0
    overdue: int = 0
    avg_hours: float = 0

@router.post("/burnout")
def burnout(data: BurnoutInput):
    return detect_burnout(data.dict())

# ── Productivity Score ────────────────────────────────────────────────────────
class HistoryEntry(BaseModel):
    date: str
    created: int
    completed: int

class ProductivityInput(BaseModel):
    user_id: int
    history: list[HistoryEntry] = []

@router.post("/productivity")
def productivity(data: ProductivityInput):
    return get_productivity_score([h.dict() for h in data.history])
