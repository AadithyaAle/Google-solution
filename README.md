# GATI Control Tower

Real-time logistics control tower for fleet and warehouse operations.

## Run Locally

### 1. Backend (Terminal 1)

```bash
cd /home/kartikeyayadav/Desktop/Google-solution
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Backend API will be available at:
- `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

### 2. Frontend (Terminal 2)

```bash
cd /home/kartikeyayadav/Desktop/Google-solution
npm run frontend:install
npm run dev
```

Frontend will run at:
- `http://localhost:5173`

## Root Scripts

From project root:

```bash
npm run dev       # starts frontend dev server
npm run build     # builds frontend production bundle
npm run preview   # preview built frontend
```

## Notes

- Start backend first, then frontend.
- If port `8000` is busy:

```bash
lsof -i :8000
kill -9 <PID>
```

- If port `5173` is busy, Vite will suggest another port automatically.
