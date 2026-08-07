# Attendance System (onTime)

Web-based attendance tracking with automatic salary deductions. Employees
check in/out against a per-company office schedule; the system flags late
arrivals, missing check-outs and absences, applies configurable deductions,
and reports a net salary per month.

**Stack:** React (Vite + Tailwind) · Express · MongoDB (Mongoose) · Node 18+

---

## Features

- Multi-tenant: one codebase, isolated companies, each with its own timezone,
  office schedule, deductions and network rules.
- Role-based access: `employee`, `admin`, `superadmin`.
- Email-based onboarding: new users receive a one-time setup link (no
  passwords sent in plain text).
- Check-in / check-out with working-hours enforcement and IP enforcement
  (optional).
- Automated absent marking: an hourly job flags employees who never checked in.
- **Fully configurable salary deductions** (per company, via admin UI or API):
  late check-in rate, no check-out rate, absent rate, late grace minutes,
  no-check-out grace hours — all as percentages of daily salary.
- Per-month net salary report with deduction breakdown.
- JWT sessions with server-side invalidation on password/role changes.
- Structurally audited for multi-tenant isolation (company scoping on every
  data access path).
- **Superadmin console**: company CRUD, status toggles with confirm, search,
  primary admin listing, company detail with back navigation.

## Quickstart (local development)

Prerequisites: Node 18+, MongoDB running locally (`mongod` on `:27017`).

```bash
# 1. Configure the API
cp server/.env.example server/.env
#    - set MONGO_URL (defaults to localhost)
#    - set JWT_SECRET to at least 32 random chars:
#      node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
#    - optionally set EMAIL_USER / EMAIL_PASS for real setup emails

# 2. Install dependencies (root installs the shared dev tooling)
npm install
npm install --prefix server
npm install --prefix client

# 3. Run API + client together (concurrently)
npm run dev
#    API    -> http://localhost:5000  (health: /health)
#    Client -> http://localhost:5173
```

In dev, the Vite dev server proxies `/auth`, `/admin`, `/attend`, `/byId`,
`/superadmin` and `/health` to the API on `:5000`, so the client runs without
CORS. To run each side separately: `npm run dev:server` / `npm run dev:client`.

### First account

Register a company + admin at `/start` (or `POST /auth/register`). The admin
receives a one-time setup link (emailed, or returned as `setupLink` when the
email fails / `SKIP_EMAIL=true`). Open the link, set a password, and log in.

### Tests & lint

```bash
npm test                # runs the server suite (vitest)
npm test --prefix server
npm run lint --prefix server   # ESLint (server + tests)
npm run lint --prefix client   # ESLint (React)
```

Tests use an in-memory MongoDB (`mongodb-memory-server`) and are fully
self-contained — no local MongoDB needed to run them:

- `server/test/unit` — pure logic: deductions, validation, passwords, slugs,
  company helpers, JWT generation.
- `server/test/integration` — HTTP flows against the real Express app:
  registration, setup, login, password rotation, check-in/out, records,
  cross-company authorization, admin CRUD + config, superadmin tenant
  management, the absent sweeper, and IP validation.

CI (`.github/workflows/ci.yml`) runs server lint + tests and client
lint + build on every push/PR.

## Environment variables

All server variables live in `server/.env` (see `server/.env.example`).

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONGO_URL` | yes | — | MongoDB connection string |
| `JWT_SECRET` | yes (≥32 chars) | — | Token signing secret |
| `CLIENT_ORIGIN` | no | `http://localhost:5173` | Allowed CORS origins (comma-separated) |
| `FRONTEND_URL` | no | `http://localhost:5173` | Base URL embedded in setup-link emails |
| `TIMEZONE` | no | `Asia/Karachi` | Default timezone for `/attend/server-time` |
| `EMAIL_USER` / `EMAIL_PASS` | no | — | SMTP credentials (Gmail app passwords) |
| `SKIP_EMAIL` | no | `false` | `true` prints setup links instead of emailing |
| `DEDUCTIONS_ENABLED` | no | `false` | Seed default: enable deductions for new companies |
| `LATE_CHECKIN_RATE` | no | `50` | Seed default: late check-in deduction % of daily salary |
| `NO_CHECKOUT_RATE` | no | `50` | Seed default: no check-out deduction % of daily salary |
| `ABSENT_RATE` | no | `100` | Seed default: absent deduction % of daily salary |
| `LATE_GRACE_MINUTES` | no | `15` | Seed default: minutes after start before late flag |
| `NO_CHECKOUT_GRACE_HOURS` | no | `2` | Seed default: hours after end before no-checkout deduction |
| `IP_ENFORCEMENT` | no | off | `strict` blocks check-in/out from non-approved IPs |
| `CRON_ENABLED` | no | — | Set `true` on exactly **one** worker for the absent sweeper |
| `RATE_LIMIT_LOGIN` | no | `10` | Login attempts per 15 min per IP |
| `RATE_LIMIT_AUTH` | no | `100` | Registration attempts per 15 min per IP |
| `LOG_LEVEL` | no | `info` | `debug` \| `info` \| `warn` \| `error` |

Client variables live in `client/.env`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | dev: `""` (proxy) | Base API URL. **Required for production builds** — `npm run build` fails if unset, so a deployed client can never silently call `localhost`. |

## Project structure

```
server/
  index.js             Express app (exported for tests), env guard, /health
  config/db.js         Mongoose connection
  models/              User, Company, Attendance
  middleware/          auth, role, company, IP validation
  common/              shared rules: deductions, validation, onboarding, authz
  controllers/         route handlers (auth, admin, attendance, superadmin)
  utils/               dayjs (tz), logger, transactions, mail, JWT, sweeper
  test/                vitest unit + integration suites
client/
  src/
    Pages/             login, setup, landing, home
    Components/
      Dashboard/       StatCard, DashboardHeader, AttendanceHeatmap,
                       CheckInChart, SalaryDonut, TrendChart, HourlyHistogram
      Superadmin/      Companies, CompanyDetail, InviteSuperAdmin
      UI/              clocking, profile, admin screens, configuration,
                       employees, attendance history, timezone, office timing
    Context/           auth/role/id/company providers
    lib/               API config, token helpers
docs/
  api.md               endpoint reference
  deductions.md        salary deduction rules
  security-audit.md    multi-tenant isolation notes
```

## Deployment notes

- The API is a stateless Express app; scale horizontally behind a reverse
  proxy (run with `app.set("trust proxy", 1)` — already configured).
- `CRON_ENABLED=true` on one instance only, or the absent sweeper will write
  duplicate rows (it upserts, so the effect is benign, but run one worker).
- `IP_ENFORCEMENT=strict` only works if employees connect from IPs listed in
  the company's `allowedRouterIPs` (the company's public egress IPs).
- New database indexes are created in the background and do not require
  downtime, but the unique partial index on `User.setupToken` should be built
  once on existing deployments.

## API

See [docs/api.md](docs/api.md) for the full endpoint reference.

## License

Proprietary / internal project.
