# Project Collaboration Rules

This repository is structured for parallel development. Follow these rules to prevent merge conflicts.

---

## How to Run

open two the project in  terminals and run:

```bash
cd backend/
pip install "fastapi[standard]" pandas scikit-learn
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

```bash
cd frontend/
npm install
npm run dev
```

## Backend (FastAPI)

**Work only in:** `backend/app/routers/[your_name]/`

**Permitted:**
* Create personal .py files.
* Load specific models or data within your folder.
* Define your own API endpoints.

**Strictly Prohibited:**
* Modifying `backend/app/main.py`.
* Modifying `backend/app/routers/__init__.py`.
* Modifying any other member's folder or shared files.

---

## Frontend (React)

**Work only in:** `frontend/src/members/[your_name]/`

**Permitted:**
* Create pages and components.
* Call only your own backend endpoints.
* Export features from your local `index.ts`.

**Strictly Prohibited:**
* Modifying `frontend/src/components/ui/` or `layout/`.
* Modifying `frontend/src/hooks/` or `lib/`.
* Modifying `App.tsx` or `main.tsx`.
* Modifying any other member's folder.

---

## Reference Template
Use Ahmed’s folders as the structural template:
* `backend/app/routers/ahmed/`
* `frontend/src/members/ahmed/`

---

## Core Rule
**If a folder is not named after you, do not modify it.**