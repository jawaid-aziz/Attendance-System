# OnTime Attendance Server

## Requirements
- Node.js 18+
- npm 9+ (or yarn/pnpm)
- MongoDB 5+ (or use `mongodb-memory-server` for tests)

## Quickstart

```bash
# From repo root
cd server
cp .env.example .env   # edit as needed
npm install
npm run dev            # starts on :5000 (with nodemon)
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Production start (`node index.js`) |
| `npm test` | Run vitest suite (unit + integration) |
| `npm run lint` | ESLint |
| `npm run seed` | Seed DB (uses `server/.env` vars) |

## Environment variables

See `server/.env.example` for all options. Key variables:

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONGO_URL` | yes | — | MongoDB connection string |
| `JWT_SECRET` | yes (≥32 chars) | — | Token signing secret |
| `TIMEZONE` | no | `Asia/Karachi` | Default timezone for server-time |
| `DEDUCTIONS_ENABLED` | no | `false` | Seed default for deductions |
| `LATE_CHECKIN_RATE` | no | `50` | Late check-in % of daily salary |
| `NO_CHECKOUT_RATE` | no | `50` | No check-out % of daily salary |
| `ABSENT_RATE` | no | `100` | Absent % of daily salary |
| `LATE_GRACE_MINUTES` | no | `15` | Late grace window (minutes) |
| `NO_CHECKOUT_GRACE_HOURS` | no | `2` | No-checkout grace (hours) |
| `EMAIL_USER` / `EMAIL_PASS` | no | — | SMTP credentials |
| `SKIP_EMAIL` | no | `false` | Print setup links instead of emailing |
| `IP_ENFORCEMENT` | no | off | `strict` blocks non-approved IPs |
| `CRON_ENABLED` | no | — | Enable absent sweeper on one worker |
| `RATE_LIMIT_FORGOT_PASSWORD` | no | `5` | Password-reset emails per hour per IP |

## Architecture highlights

- **Express** app exported from `index.js` (tests import it directly).
- **Mongoose** models: `User`, `Company`, `Attendance` with partial unique indexes.
- **Middleware chain**: `authenticateToken` → `authorizeRole` → `authorizeCompany`.
- **Common rules** in `server/common/`:
  - `deductions.js` — rate-percent helpers + `getDeductionConfig()`.
  - `validation.js` — timezone, schedule, IP validators.
  - `onboarding.js` — company/user creation with setup tokens.
- **Controllers** organized by domain: `auth`, `admin`, `attendance`, `superadmin`.
- **Auth flows**: `POST /auth/register` (company + admin setup link),
  `POST /auth/forgot-password` + `POST /auth/reset-password/:token` (email
  password recovery), `POST /auth/change-password` (authenticated rotation).
- **Absent sweeper** in `utils/absentSweeper.js` — cron job, runs on one worker.

## Tests

```bash
npm test              # all (unit + integration)
npm test -- --run    # single run (no watch)
```

Uses `mongodb-memory-server` for isolation — no local MongoDB required.

## Deployment notes

- Stateless Express app; scale horizontally behind a reverse proxy
  (`app.set("trust proxy", 1)` already set).
- Run `CRON_ENABLED=true` on **exactly one** instance for the absent sweeper.
- `IP_ENFORCEMENT=strict` only works when employees connect from IPs in
  `allowedRouterIPs` (the company's public egress IPs).
- `JWT_SECRET` must be ≥ 32 chars; generate with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`