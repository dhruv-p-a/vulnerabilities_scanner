from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from scanner.headers import analyze_headers
from scanner.cms import detect_cms
from scanner.ssl_check import check_ssl
import time
import uuid

app = FastAPI(title="VulnScan Lite API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for async simulation
scans = {}

@app.post("/scan")
async def initiate_scan(url: str = Query(..., description="The URL to scan")):
    scan_id = str(uuid.uuid4())
    scans[scan_id] = {"status": "pending", "url": url}
    return {"scan_id": scan_id}

@app.get("/scan/{scan_id}/status")
async def get_scan_status(scan_id: str):
    if scan_id not in scans:
        return {"status": "failed", "message": "Scan ID not found"}

    scan_data = scans[scan_id]

    if scan_data["status"] == "pending":
        url = scan_data["url"]

        # Ensure URL has protocol
        if not url.startswith("http"):
            url = "https://" + url

        headers, header_score = analyze_headers(url)
        cms = detect_cms(url)
        ssl_msg, ssl_score = check_ssl(url)

        total_score = header_score + ssl_score + 15 # +15 base score for accessibility

        scans[scan_id] = {
            "status": "completed",
            "url": url,
            "score": min(total_score, 100),
            "cms": cms,
            "headers": headers,
            "ssl": ssl_msg
        }

    return scans[scan_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
