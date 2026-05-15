from fastapi import FastAPI
from routers import ai, trading, risk

app = FastAPI(
    title="foresmart-intelligence",
    description="Ranim ForeSmart Investment Corporation - AI Engine", 
    version="1.0"
)

app.include_router(ai.router)
app.include_router(trading.router)
app.include_router(risk.router)

@app.get("/")
def home():
    return {"status": "foresmart-intelligence active", "version": "1.0"}
