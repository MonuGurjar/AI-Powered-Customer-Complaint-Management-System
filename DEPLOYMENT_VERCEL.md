# Vercel Deployment & Production Setup Guide

This guide details how to deploy the **AIVOA AI-Powered Customer Complaint Management System** to **Vercel**.

---

## Deployment Strategy Options

Vercel is optimized for static and frontend applications with serverless functions. Depending on your backend hosting preference, choose one of the following two deployment methods:

### Option A: Decoupled Deployment (Recommended & Easiest)
- **Frontend (Vite + React)**: Deployed to **Vercel** with automatic HTTPS and CDN edge distribution.
- **Backend (FastAPI + LangGraph)**: Deployed to a Python serverless/container provider such as **Render**, **Railway**, **Fly.io**, or **AWS App Runner**.

### Option B: Monorepo Single Vercel Deployment
- Both Frontend and FastAPI backend hosted together on Vercel using Vercel Python Serverless Functions.

---

## Option A: Step-by-Step Vercel Deployment (Recommended)

### Step 1: Deploy Backend to Render / Railway / Fly.io

1. Push your repository to GitHub.
2. Create a new Web Service on [Render.com](https://render.com) or [Railway.app](https://railway.app).
3. Set the Root Directory to `backend`.
4. Set Build Command: `pip install -r requirements.txt`
5. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variable:
   - `GROQ_API_KEY`: Your Groq API key token.
7. Note down your live backend API URL (e.g. `https://aivoa-qms-api.onrender.com`).

### Step 2: Deploy Frontend to Vercel

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** -> **Project** and import your GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable in Vercel:
   - `VITE_API_BASE_URL`: Your deployed backend URL (e.g., `https://aivoa-qms-api.onrender.com/api`).
5. Click **Deploy**.

---

## Option B: Single Vercel Project Deployment Configuration

To deploy both Frontend and FastAPI Backend under a single Vercel project, use the included root `vercel.json` configuration:

### Root Configuration (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/app/main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/app/main.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

### Vercel Rewrites for React SPA Routing (`frontend/vercel.json`)

Inside `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Vercel CLI Quick Deployment Command

If you have Vercel CLI installed locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy Frontend to Vercel
cd frontend
vercel --prod
```
