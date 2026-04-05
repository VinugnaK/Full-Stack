"""
train_models.py
───────────────
Trains and saves both the Overrun Prediction and Burnout Detection models.
Run once before starting the AI service:

    python train_models.py

Models are saved to the models/ directory and loaded automatically by prediction_service.py.
"""
import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

MODEL_DIR = Path(__file__).parent / "models"
DATA_DIR  = Path(__file__).parent / "data"
MODEL_DIR.mkdir(exist_ok=True)

# ── Overrun Model ──────────────────────────────────────────────────────────────

def generate_overrun_data(n=2000, seed=42):
    """Synthetic training data for overrun prediction."""
    rng = np.random.default_rng(seed)
    X, y = [], []

    for _ in range(n):
        priority       = rng.integers(0, 3)          # 0=low, 1=med, 2=high
        progress       = rng.uniform(0, 1)
        days_norm      = rng.uniform(-1.0, 2.0)       # negative = past deadline
        hours_norm     = rng.uniform(0, 5)
        active_load    = rng.uniform(0, 5)
        completion_rate = rng.uniform(0, 1)
        overdue_rate   = rng.uniform(0, 0.8)
        avg_days       = rng.uniform(0, 4)
        remaining      = 1.0 - progress
        overdue_flag   = float(days_norm < 0)

        feat = [priority, progress, days_norm, hours_norm,
                active_load, completion_rate, overdue_rate,
                avg_days, remaining, overdue_flag]

        # Heuristic label
        risk_score = (
            (1 - completion_rate) * 0.25
            + overdue_rate * 0.25
            + max(0, -days_norm) * 0.20
            + active_load / 5.0 * 0.10
            + remaining * 0.10
            + overdue_flag * 0.10
        )
        label = int(risk_score > 0.45)

        X.append(feat)
        y.append(label)

    return np.array(X, dtype=np.float32), np.array(y)


def train_overrun_model():
    print("Training overrun prediction model…")
    X, y = generate_overrun_data(n=3000)

    # Also load real data if CSV exists
    csv_path = DATA_DIR / "overrun_training_data.csv"
    if csv_path.exists():
        import pandas as pd
        df = pd.read_csv(csv_path)
        X_real = df.drop("label", axis=1).values.astype(np.float32)
        y_real = df["label"].values
        X = np.vstack([X, X_real])
        y = np.concatenate([y, y_real])
        print(f"  Loaded {len(y_real)} real samples from CSV.")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingClassifier(
        n_estimators=150, max_depth=4, learning_rate=0.1, random_state=42
    )
    model.fit(X_train, y_train)

    print("Overrun model – test classification report:")
    print(classification_report(y_test, model.predict(X_test)))

    path = MODEL_DIR / "overrun_model.pkl"
    joblib.dump(model, path)
    print(f"  Saved → {path}\n")


# ── Burnout Model ──────────────────────────────────────────────────────────────

def generate_burnout_data(n=2000, seed=7):
    rng = np.random.default_rng(seed)
    X, y = [], []

    for _ in range(n):
        completion_rate = rng.uniform(0, 1)
        overdue_rate    = rng.uniform(0, 0.9)
        hours_norm      = rng.uniform(0, 2)
        volume_norm     = rng.uniform(0, 2)

        feat = [completion_rate, overdue_rate, hours_norm, volume_norm]

        score = (
            (1 - completion_rate) * 0.35
            + overdue_rate * 0.30
            + min(hours_norm, 1) * 0.20
            + min(volume_norm, 1) * 0.15
        )
        label = int(score > 0.45)
        X.append(feat)
        y.append(label)

    return np.array(X, dtype=np.float32), np.array(y)


def train_burnout_model():
    print("Training burnout detection model…")
    X, y = generate_burnout_data(n=2000)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)

    print("Burnout model – test classification report:")
    print(classification_report(y_test, model.predict(X_test)))

    path = MODEL_DIR / "burnout_model.pkl"
    joblib.dump(model, path)
    print(f"  Saved → {path}\n")


# ── Entry point ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    train_overrun_model()
    train_burnout_model()
    print("✅ All models trained and saved successfully.")
