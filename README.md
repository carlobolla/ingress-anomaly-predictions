# Anomaly Predictions

A prediction game for Ingress events. Users log in with Telegram and submit predictions for Anomaly, Global Challenge, and minor events. Scores are calculated based on how accurately each prediction matches the actual result.

## Project Structure

```
anomalypredictions/
├── ui/       # React frontend (Vite + TypeScript)
└── server/   # Express backend (Node.js + TypeScript)
```

## Tech Stack

**Frontend** — React 18, TypeScript, Vite, HeroUI, Tailwind CSS, React Router v7, Axios

**Backend** — Node.js, Express, TypeScript, Supabase (PostgreSQL), Telegram OIDC authentication (JWT)
