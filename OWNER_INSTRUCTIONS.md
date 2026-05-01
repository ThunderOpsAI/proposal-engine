# Owner Instructions

This project is an MVP backend for Proposal Engine.

## 1. Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm 9+

## 2. Install

```bash
npm install
```

## 3. Run locally

```bash
npm run dev
```

If your machine already uses port `3000`, run:

```bash
PORT=3010 npm start
```

## 4. Health check

```bash
curl -s http://127.0.0.1:3000/health
```

Expected:

```json
{"ok":true,"service":"proposal-engine"}
```

## 5. Generate proposal

```bash
curl -s -X POST http://127.0.0.1:3000/generate/proposal \
  -H "Content-Type: application/json" \
  -d '{
    "job_description":"Need a React/Node dev to build a client dashboard with auth and reports.",
    "tone":"confident",
    "user_profile":"5+ years in SaaS app delivery",
    "include_pricing":true
  }'
```

## 6. Database

- Uses local SQLite file: `data.sqlite`
- Tables: `users`, `jobs`, `proposals`
- No Supabase dependency

## 7. Production notes

- Keep API stateless at request level.
- Use a managed free DB later if needed (Neon or Turso) while preserving API contract.
- Add auth/rate limiting before public launch.

## 8. Next owner tasks

- Add frontend for editing/refining generated proposals.
- Add authentication (email/password or OAuth).
- Add basic tests for `/generate/proposal`.
- Add logging/monitoring + error tracking.
