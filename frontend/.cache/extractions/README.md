# Demo Cache Files

This directory contains pre-generated extraction cache files for the demo dashboards.

## Purpose

These cache files enable the demo pages to work **completely offline** without:
- Gemini API calls
- Supabase database calls  
- Backend API calls

This is essential for **standby mode** where the service is paused to save API costs.

## Cache Structure

Each demo has 9 cached sections:
- `identity` - Station identity, ownership, personnel, litigation
- `operational` - Infrastructure, fuel types, safety compliance
- `competitor` - Competitive landscape analysis
- `financial` - OPEX, margins, revenue estimates
- `location` - Geographic risks, demand drivers
- `sentiment` - Customer reviews and sentiment analysis
- `score` - Strategic scoring with methodology
- `anomalies` - Data anomalies and overflow intel
- `payment_methods` - Digital payments, fleet cards, POS

## File Naming

Files are named: `{section}_{hash}.json`

Where `hash` is the first 12 characters of MD5 hash of the demo text file.

### Current Demos

- **demo1** (Sher Service Station): `b2bae8e42f39`
- **demo2** (Jay Garud Gas Station): `7a408fe42bb6`
- **demo3** (Jai Shree Ganesh): `aab4b3b7ea35`

## Regenerating Cache

If you update demo text files in `public/demos/`, you need to regenerate cache:

1. Set `NEXT_PUBLIC_STANDBY_MODE=false` in `.env.local`
2. Set `NEXT_PUBLIC_API_URL=http://localhost:6055` 
3. Add your `GOOGLE_GENERATIVE_AI_API_KEY`
4. Visit each demo page in the browser: `/demo/demo1`, `/demo/demo2`, `/demo/demo3`
5. Wait for all 9 cards to load on each page
6. The new cache files will be automatically generated
7. Commit the updated cache files to git

## Git Tracking

**IMPORTANT**: These cache files MUST be committed to git for standby mode to work.

The parent `.gitignore` explicitly notes that `.cache/extractions/` is tracked.

## How It Works

The extraction system (`src/actions/extract.ts`) follows this hierarchy:

1. **File cache** (this directory) - checked first
2. **Supabase cache** - checked second (skipped if no API_BASE)
3. **Gemini API** - called only if both caches miss (blocked in standby mode)

In standby mode (`NEXT_PUBLIC_STANDBY_MODE=true`):
- `API_BASE` is empty
- Supabase calls are skipped
- Gemini calls are blocked
- Only file cache is used

## Cache Size

Typical cache file size: 2-10 KB per section  
Total per demo: ~20-50 KB  
All 3 demos: ~60-150 KB

This is tiny and safe to commit to git.
