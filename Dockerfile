# Container image for NYC Airbnb Market Intelligence.
#
# One process serves both the compiled React UI (frontend/dist) and the Flask REST
# API (backend/app.py, mounted by server.py), so the container behaves exactly like
# a local `python server.py` run. This makes it deployable to any Docker host —
# Hugging Face Spaces, Render, Railway, Fly.io, a university VM — with no changes.
#
# Port 7860 is what Hugging Face Spaces expects a Docker Space to expose.
#
# NOTE: this image does NOT compile the frontend. frontend/dist is committed to the
# repository, so if you change the UI source, run `npm run build` inside frontend/
# and commit the result before building this image.
FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=7860

WORKDIR /app

# Runtime dependencies only, pinned to the versions that produced the saved model.
COPY requirements-deploy.txt .
RUN pip install --no-cache-dir -r requirements-deploy.txt

COPY . .

EXPOSE 7860

# A single worker keeps exactly one copy of the 65 MB forest resident in memory;
# threads provide concurrency without duplicating the model.
CMD ["gunicorn", "server:app", "--bind", "0.0.0.0:7860", "--workers", "1", "--threads", "4", "--timeout", "120"]
