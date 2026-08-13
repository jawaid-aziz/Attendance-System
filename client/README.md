# OnTime Attendance — Frontend

## Requirements
- Node.js 18+
- npm 9+ (or yarn/pnpm)

## Quickstart

```bash
# From repo root
cd client
npm install
npm run dev            # starts Vite on :5173 (proxies /api to server :5000)
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server (with API proxy) |
| `npm run build` | Production build (requires `VITE_API_URL`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint (0 errors required) |

## Environment variables

Create `client/.env` (or `client/.env.local`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | dev: `""` (Vite proxy) | **Required for `npm run build`** — base API URL (e.g. `https://api.example.com`). Build fails if unset to prevent accidental `localhost` calls in production. |

## Tech stack

- **React 18** + **Vite 6** + **Tailwind CSS 3** (cornflower-blue palette)
- **React Router v7** with protected/public route guards
- **react-hot-toast** for notifications
- **Radix UI** primitives (Dialog, Select, Table, etc.) + custom `cn` utility
- **recharts** for dashboard visualizations (lazy-loaded)
- **lucide-react** icons

## Project structure

```
src/
  Pages/
    Landing.jsx        Public marketing page
    Login.jsx          Email/password login (with "Forgot password?" link)
    ForgotPassword.jsx Request a password-reset link by email
    ResetPassword.jsx  Set a new password from the emailed reset link
    Setup.jsx          One-time password setup via emailed link
    Home.jsx           Role-split dashboard (admin vs employee)
  Components/
    Dashboard/         StatCard, DashboardHeader, AttendanceHeatmap,
                       CheckInChart, SalaryDonut, TrendChart, HourlyHistogram
    Superadmin/        Companies, CompanyDetail, InviteSuperAdmin
    Configuration.jsx  Deduction config (toggle, 3 rates, 2 graces)
    EmployeesData.jsx  Searchable employee table with stat cards
    AttendanceHistory.jsx  Monthly records + summary cards
    AddEmployee.jsx    Admin form with spinner submit
    Profile.jsx        Avatar header, section cards, read-only for non-admins
    Timezone.jsx       Current tz banner + select + save
    OfficeTimings.jsx  Weekly schedule with weekend shading + sticky save
    Clocking.jsx       Live check-in/out card with todayRecord
    UI/                Radix-based primitives (Button, Card, Table, etc.)
  Context/
    AuthProvider, RoleProvider, IdProvider, CompanyProvider
  lib/
    config.js          API_URL helper
  hooks/
    useServerTime, useTargetUser, useUser
```

## Design system

- Base palette: `cornflower-blue` (Tailwind custom color).
- Card style: `rounded-2xl border border-slate-100 bg-white shadow-sm`.
- Stat cards: icon + label + value + sub, tone via `bg-{color}-50 text-{color}-600`.
- Skeletons: `animate-pulse rounded-md bg-muted` for all loading states.
- Buttons use `Loader2` spinner when submitting.
- Badges: `bg-green-100 text-green-700` (active), `bg-red-100 text-red-700` (inactive), `bg-amber-100 text-amber-700` (late), `bg-cornflower-blue-50 text-cornflower-blue-700` (admin).

## Production build

```bash
# Must provide VITE_API_URL or build fails
VITE_API_URL=https://api.example.com npm run build
# Output in client/dist/
```

The build step enforces `VITE_API_URL` so a deployed client can never silently call `localhost`.

## Lint

```bash
npm run lint   # 0 errors required; pre-existing warnings in UI components only
```