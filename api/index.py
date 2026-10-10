import os
import json
import math
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Expose-Headers": "Access-Control-Allow-Origin",
}

def calculate_p95(values):
    if not values:
        return 0.0
    sorted_vals = sorted(values)
    r = (len(sorted_vals) - 1) * 0.95
    n = math.floor(r)
    l = r - n
    if n + 1 < len(sorted_vals):
        return sorted_vals[n] + l * (sorted_vals[n + 1] - sorted_vals[n])
    return float(sorted_vals[n])

current_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(current_dir, "q-vercel-latency.json")

telemetry = []
if os.path.exists(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        telemetry = json.load(f)

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    if request.method == "OPTIONS":
        return JSONResponse(content={}, headers=CORS_HEADERS)
    response = await call_next(request)
    for key, value in CORS_HEADERS.items():
        response.headers[key] = value
    return response

@app.post("/{full_path:path}")
async def handle_post(request: Request, full_path: str = ""):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"regions": []}, headers=CORS_HEADERS)

    regions_req = body.get("regions", [])
    threshold_ms = float(body.get("threshold_ms", 180))

    res_list = []
    for reg in regions_req:
        matched = [f for f in telemetry if f.get("region") == reg]
        if not matched:
            continue

        latencies = [f["latency_ms"] for f in matched]
        uptimes = [f["uptime_pct"] for f in matched]

        avg_lat = round(sum(latencies) / len(latencies), 2)
        p95_lat = round(calculate_p95(latencies), 2)
        avg_up = round(sum(uptimes) / len(uptimes), 3)
        breaches = sum(1 for la in latencies if la > threshold_ms)

        res_list.append({
            "region": reg,
            "avg_latency": avg_lat,
            "p95_latency": p95_lat,
            "avg_uptime": avg_up,
            "breaches": breaches
        })

    return JSONResponse(content={"regions": res_list}, headers=CORS_HEADERS)

@app.get("/{full_path:path}")
async def handle_get(full_path: str = ""):
    return JSONResponse(
        {"status": "ok"},
        headers=CORS_HEADERS
    )
