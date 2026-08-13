# Deployment Guide (Cloudflare Pages + Render)

The app is deployed as two independent pieces on free tiers:

- **Client** — Vite React SPA → static build → **Cloudflare Pages**
- **Server** — Express API → **Render** (free web service)
- **Database** — **MongoDB Atlas** (already in use; free M0 cluster)

## 1. MongoDB Atlas

Your `MONGO_URL` already points at the Atlas cluster
(`mongodb+srv://.../onTime`). No extra steps.

## 2. Render — API

1. Push the repo to GitHub and create a **New Web Service** from it in Render.
2. Render detects `server/render.yaml` and pre-fills:
   - **Root directory:** `server`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Health check path:** `/health`
   - **Plan:** Free
3. In **Environment**, set the `sync: false` secrets (never commit them):
   - `MONGO_URL` — the Atlas connection string
   - `JWT_SECRET` — ≥32 random chars
     (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `EMAIL_USER` / `EMAIL_PASS` — Gmail SMTP app-password credentials
4. Replace the placeholder `FRONTEND_URL` / `CLIENT_ORIGIN` with your real
   Cloudflare Pages URL (e.g. `https://yourapp.pages.dev`).
5. `render.yaml` also sets `NODE_ENV=production`, `TRUST_PROXY=true`,
   `IP_ENFORCEMENT=off` and `CRON_ENABLED=true` (free plan runs one instance,
   so the absent sweeper has no duplicate-write risk).

### Keeping the free instance awake

Render free services **spin down after ~15 min of inactivity** (30-60s cold
start on the next request), which also pauses the in-process absent sweeper.
To keep it running 24/7 within the free 750 hours/month, add a free keep-alive
that hits `/health` more often than every 15 minutes:

- **UptimeRobot** (recommended) — free 5-minute uptime checks on
  `https://<api>.onrender.com/health`; doubles as downtime monitoring.
- **cron-job.org** — free job calling `/health` every 14 minutes.

`/health` is exempt from rate limiting, so pinging it is safe.

## 3. Cloudflare Pages — client

1. In Cloudflare Pages, connect the GitHub repo (or use Direct Upload of
   `client/dist`).
2. Build configuration:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `client`
3. **Environment variables:** set `VITE_API_URL` to
   `https://<api>.onrender.com` — the production build **fails without it**,
   so a deployed client can never silently call `localhost`.
4. SPA routing is handled by `client/public/_redirects` (`/* /index.html 200`),
   which Cloudflare Pages picks up automatically for `/login`, `/:slug`,
   `/setup/:token`, `/reset/:token`, etc.

## 4. Verify

- `https://<api>.onrender.com/health` → `{ "status": "ok", "db": "connected" }`
- Register a company via the SPA; the setup link email should arrive and the
  dashboard should load at `https://<app>.pages.dev/<slug>`.

## Notes

- **Custom domain** on Cloudflare Pages is free; Render free allows a custom
  domain for the API too.
- `IP_ENFORCEMENT=off` is intentional: in the cloud, staff connect through
  public/NAT IPs that won't match a company's `allowedRouterIPs`.
- Do **not** run the seed against production data — it reassigns companyless
  users and promotes admins to superadmin (it refuses to run unless
  `SEED_ALLOWED=true`).