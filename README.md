# Anomaly Predictions

A prediction game for Ingress Anomaly series. Users log in with Telegram and submit predictions for each event in a series. Scores are calculated after results are published, based on how accurately each prediction matched the actual outcome.

## Project Structure

```
anomalypredictions/
├── ui/       # React frontend (Vite + TypeScript)
└── server/   # Express backend (Node.js + TypeScript)
```

## Tech Stack

**Frontend** — React 19, TypeScript, Vite, HeroUI v3, Tailwind CSS v4, React Router v7, Axios, Day.js

**Backend** — Node.js, Express, TypeScript, Supabase (PostgreSQL), Telegram authentication (JWT)