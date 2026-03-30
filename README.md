# 🌍 Supply Chain Spine - B2B Control Tower

Welcome to the team! This is a real-time, AI-powered supply chain monitoring system built for the Google Solution Challenge. 

---

## 🚀 Quick Start (Onboarding)

Follow these steps exactly to get the project running on your local machine:

### 1. Clone the Repository
```bash
git clone [https://github.com/AadithyaAle/Google-solution.git](https://github.com/AadithyaAle/Google-solution.git)
cd Google-solution
```

### 2. Backend Setup (Python)
1. Navigate to the backend: `cd backend`
2. Create a virtual environment: `python3 -m venv venv`
3. Activate it: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. **Setup Environment Variables:**
   * Copy the template: `cp .env.example .env`
   * Open `.env` and paste your personal **Gemini API Key**.

### 3. Frontend Setup (React)
1. Navigate to the frontend: `cd ../frontend`
2. Install dependencies: `npm install`
3. **Setup Environment Variables:**
   * Create a file named `.env`.
   * Add: `VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here`
4. Start the dashboard: `npm run dev`

---

## 🛡️ Contribution Workflow (IMPORTANT)

To keep our `main` branch stable and our CI/CD green, follow this workflow for **every** feature:

### 1. Create a Feature Branch
Never code directly on `main`. Create a descriptive branch:
```bash
git checkout -b feat/add-map-markers
```

### 2. Test Locally
Before pushing, run the backend tests to ensure you didn't break the routing logic:
```bash
cd backend
pytest
```

### 3. Push and Open a Pull Request (PR)
```bash
git add .
git commit -m "feat: added interactive markers to the map"
git push origin feat/add-map-markers
```
* Go to GitHub and open a **Pull Request**.
* **Wait for the Checks:** Our GitHub Actions will automatically run. If you see a **Red X**, check the logs, fix the code, and push again.
* Once you see the **Green Checkmark**, you are clear to merge!

---

## 🛠️ Tech Stack
* **Backend:** FastAPI, NetworkX (Graph Theory), Google Gemini AI.
* **Frontend:** React, Tailwind CSS, Google Maps API.
* **CI/CD:** GitHub Actions (Automated Pytest).

---

> **Note:** This is a living document. We will update the final project documentation once all features are integrated.
```

---
