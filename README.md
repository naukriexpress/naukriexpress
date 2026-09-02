# NaukriExpress

A modern, mobile-responsive job update portal for India, built with Next.js 14 (App Router), TypeScript and Tailwind CSS. Founded by BGI Cybercafe. Ships with sample job data so it runs immediately, and connects to a real PostgreSQL/Supabase database with one environment variable.

## Quick Start (local, no database needed)

```bash
npm install
npm run seed      # (re)generates dummy job data in data/jobs.json
npm run dev
```

Visit http://localhost:3000

**Admin panel:** http://localhost:3000/admin/login
- Username: `admin`
- Password: `BgiAdmin@123`

With no `DATABASE_URL` set, the app reads/writes `data/jobs.json` on disk. This is great for trying everything out immediately, but it will **not** persist on serverless hosts like Vercel — see the next section before adding real jobs in production.

## Connecting a real database (Supabase/PostgreSQL) — required before going live

Jobs added through the admin panel only stay permanent once a real database is connected. This has already been wired into the code — you just need to provision the database and set one environment variable.

1. **Create a free Supabase project** at [supabase.com](https://supabase.com) (pick the Mumbai/`ap-south-1` region for speed from India).
2. **Run the schema.** Open Supabase's SQL Editor, paste the entire contents of `schema.sql` from this project, and run it. This has been tested end-to-end against a real PostgreSQL instance (tables, indexes, and the eligibility-filter query logic all verified working).
3. **Get your connection string.** In Supabase, go to Project Settings → Database → Connection string (use the "Connection pooling" string for serverless hosts like Vercel).
4. **Set `DATABASE_URL`** as an environment variable:
   - Locally: add it to `.env.local`
   - On Vercel: Project Settings → Environment Variables
5. *(Optional)* Push the same sample jobs into your new database so the site isn't empty on day one:
   ```bash
   DATABASE_URL="your-connection-string" npm run seed:pg
   ```

That's it — no other code changes needed. The app automatically detects `DATABASE_URL` and switches from the local JSON file to PostgreSQL for every read and write (`lib/db.ts` is the single dispatcher; `lib/db.pg.ts` holds the Postgres implementation, `lib/db.local.ts` the JSON fallback).

## What's included

- Public site: homepage, filterable job listing, job details pages, Admit Card / Results / Answer Key / Syllabus / Contact / About / legal pages
- Server-side eligibility filtering (gender, category, qualification, job type, state, age, last-date window) — never done in the browser, and verified against a real PostgreSQL instance
- Admin panel: dashboard stats, manage jobs (edit/delete/feature/expire), Add/Edit Job form with checkboxes and a rich text editor — no coding required to publish a job, and changes persist permanently once `DATABASE_URL` is set
- SEO: per-job metadata, Open Graph tags, JobPosting JSON-LD schema, auto-generated `sitemap.xml` and `robots.txt`
- Public JSON API at `/api/jobs` for filtered job data

## Environment variables

Copy `.env.example` to `.env.local` and adjust:

- `NEXT_PUBLIC_SITE_URL` — your production domain, used in SEO tags and sitemap
- `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` — admin login (see comment in file for generating a hash)
- `ADMIN_SESSION_SECRET` — long random string used to sign admin session cookies
- `DATABASE_URL` — your Supabase/PostgreSQL connection string (see above). Leave unset to use the local JSON store.

## Adding jobs day-to-day

Go to `/admin/jobs/new`. Every field is a checkbox, dropdown, date picker or simple text field — ticking "Female" + "SC" + "ST" + "Graduate" on a job is all that's needed for it to automatically show up when a user filters by any of those combinations on the public site. No code edits required. Once `DATABASE_URL` is set, everything you publish here is permanent.

## Deployment

This is a standard Next.js app — deploy to Vercel, Netlify, or any Node host:

```bash
npm run build
npm start
```

Set `DATABASE_URL` (and the other environment variables above) in your host's dashboard before adding real job data — without it, anything added through the admin panel will be lost whenever the serverless filesystem resets.
