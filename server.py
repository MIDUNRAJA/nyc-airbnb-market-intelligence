"""
NYC Airbnb Market Intelligence — single-command server entry point.

Run this one file and the whole application is up:

    python server.py

It does two things on a single port:
  1. Registers the complete Flask REST API defined in `backend/app.py`
     (`/api/health`, `/api/summary`, `/api/listings`, `/api/predict`, ...).
  2. Serves the pre-compiled React application from `frontend/dist`, with an
     SPA fallback so every client-side route resolves to `index.html`.

Because the API and the UI share an origin here, the frontend's relative
`/api/...` calls work with no proxy and no extra configuration — which is also
why this same file can be deployed as-is to any Python host (see README § 5.6).

Jupyter notebook note: the notebook in `notebooks/` is an independent
deliverable and is NOT required at runtime. It is not what serves this website.
The site's numbers come from `backend/build_complete_analytics.py`, which writes
`backend/analysis_results.json` (used by the API), a mirrored copy in
`frontend/src/data/` (bundled into the React build as the offline fallback),
and `backend/trained_model_pipeline.pkl` (used by `/api/predict`).
"""

import os
import sys

from flask import send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "frontend", "dist")

# `backend/app.py` resolves its own assets relative to the repo root, but it must
# be importable, so put its directory on the path first.
sys.path.insert(0, os.path.join(BASE_DIR, "backend"))

from app import app  # noqa: E402  (import after sys.path setup)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serve the built React bundle; unknown UI routes fall back to index.html."""
    if path.startswith("api/"):
        return {"error": "Endpoint not found"}, 404

    if path and os.path.isfile(os.path.join(DIST_DIR, path)):
        return send_from_directory(DIST_DIR, path)

    return send_from_directory(DIST_DIR, "index.html")


if __name__ == "__main__":
    if not os.path.isfile(os.path.join(DIST_DIR, "index.html")):
        print("WARNING: frontend/dist/index.html not found — run `npm run build` in frontend/ first.")

    port = int(os.environ.get("PORT", 5000))
    print(f"NYC Airbnb Market Intelligence running at http://localhost:{port}")
    print(f"  Web application : http://localhost:{port}/")
    print(f"  REST API health : http://localhost:{port}/api/health")
    app.run(host="0.0.0.0", port=port, debug=False)
