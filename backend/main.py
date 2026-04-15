import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data_loader import load_data
from model_loader import load_actor
from inference_engine import run_inference


# =========================
# CONFIG
# =========================
MODEL_PATH = "models/actor.pth"
OBS_DIM = 16

CONFIG = {
    "initial_capital": 10000,
    "transaction_cost": 0.001,
    "action_threshold": 0.5
}


# =========================
# INIT APP
# =========================
app = FastAPI(title="RL Trading Backend")


# Allow frontend (React etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# LOAD ON STARTUP
# =========================
print("Loading model and data...")

actor = load_actor(MODEL_PATH, OBS_DIM)
pair_data = load_data()

print(f"Loaded {len(pair_data)} pairs")


# =========================
# ROUTES
# =========================

@app.get("/")
def root():
    return {
        "status": "RL Trading Backend Running",
        "pairs_loaded": len(pair_data)
    }


# -------------------------
# Run full inference
# -------------------------
@app.get("/run")
def run_model():
    results = run_inference(actor, pair_data, CONFIG)

    return {
        "num_pairs": len(results),
        "results": results
    }


# -------------------------
# Summary (lightweight)
# -------------------------
@app.get("/summary")
def summary():
    results = run_inference(actor, pair_data, CONFIG)

    summary = []
    for r in results:
        summary.append({
            "pair": r["pair"],
            "pair_type": r["pair_type"],
            "pnl": r["total_pnl"],
            "equity": r["final_equity"]
        })

    return {"summary": summary}


# -------------------------
# Single pair detail
# -------------------------
@app.get("/pair/{pair_name}")
def get_pair(pair_name: str):
    results = run_inference(actor, pair_data, CONFIG)

    for r in results:
        if r["pair"] == pair_name:
            return r

    return {"error": "Pair not found"}


# -------------------------
# Reload data (optional)
# -------------------------
@app.get("/reload")
def reload_data():
    global pair_data
    pair_data = load_data()

    return {
        "message": "Data reloaded",
        "pairs_loaded": len(pair_data)
    }