# Voice Output Experience

Voice Output Experience consists of a FastAPI service backed by PostgreSQL. It queues text chunks and a Python worker creates and uploads the resulting audio.

## Run

1. Ensure the configured PostgreSQL server is reachable. The API creates the `users` and `jobs` tables automatically on startup.
2. Start Docker Desktop, then run `docker compose up -d` for Redis and MinIO.
3. In one terminal, run `venv\\Scripts\\uvicorn.exe app.main:app --port 5000`.
4. In another terminal, run `venv\\Scripts\\python.exe -m worker.main`.

Submit a job with:

```powershell
Invoke-RestMethod -Method Post http://localhost:5000/api/chunks -ContentType application/json -Body '{"text":"Hello from Voice Output Experience"}'
```

The worker uploads the generated file to MinIO at http://localhost:9001.
