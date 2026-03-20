from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.prediction_routes import router as prediction_router

app = FastAPI(title="SmartTask AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router, prefix="/predict")

@app.get("/health")
def health():
    return {"status": "ok", "service": "SmartTask AI"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
