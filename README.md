# Proposal Engine MVP

Proposal Engine is a lightweight backend that converts job descriptions into high-quality proposal drafts with tone variants.

This implementation does **not** use Supabase.  
It uses **SQLite (`better-sqlite3`)** as a free backend datastore.

## What is implemented

- `POST /generate/proposal`
- Input fields:
  - `job_description` (required)
  - `user_profile` (optional)
  - `tone` (optional: `formal`, `confident`, `concise`)
  - `include_pricing` (optional, default `true`)
- Job analysis:
  - requirements extraction
  - keyword extraction
  - pain point extraction
- Proposal generation:
  - short pitch
  - full proposal
  - pricing suggestion
- Variations:
  - returns additional tone versions in `variants`
- Data model tables:
  - `users`
  - `jobs`
  - `proposals`

## Architecture

`Input -> Job Analysis -> Requirement Extraction -> Proposal Generation -> Output`

## Run locally

```bash
npm install
npm run dev
```

Server starts on `http://localhost:3000` by default.

## API

### `POST /generate/proposal`

Request:

```json
{
  "job_description": "We need a full-stack developer to build an internal dashboard with authentication and reporting. Must deliver in 2 weeks.",
  "tone": "confident",
  "user_profile": "5+ years building dashboards in React and Node.",
  "include_pricing": true
}
```

Response shape:

```json
{
  "job_id": 1,
  "analysis": {
    "requirements": [],
    "keywords": [],
    "pain_points": []
  },
  "short_pitch": "...",
  "proposal": "...",
  "pricing_suggestion": "$200 - $320",
  "variants": [
    {
      "tone": "formal",
      "short_pitch": "...",
      "proposal": "...",
      "pricing_suggestion": "$200 - $320"
    }
  ]
}
```

## Notes

- API is stateless per request.
- Persistence is only for logging generated jobs/proposals.
- If you want fully managed free hosting next, good options are:
  - Neon (Postgres free tier)
  - Turso (libSQL free tier)
  - Firebase (free Spark tier)
