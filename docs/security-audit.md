# Security Audit — onTime Attendance System

Audit date: 2026-08-07
Auditor: Senior Application Security Engineer (assisted)
Scope: Full `server/` codebase (routes, controllers, middleware, models, utils,
common, config) plus authentication, authorization, rate limiting, CORS,
logging, and data exposure.

Every finding below lists severity, status (fixed in this pass / open), the
affected file, and remediation. Findings marked **fixed** have a regression test
in `server/test/`.

---

## Summary

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| HIGH-1 | High | Spoofable `X-Forwarded-For` bypasses rate limiting and office-IP enforcement | Fixed |
| B1 | High | Any employee could check in/out on behalf of colleagues | Fixed |
| E1 | High | Attendance records leaked colleagues' salary/net salary | Fixed |
| MEDIUM-2 | Medium | Login timing-based account enumeration | Fixed |
| MEDIUM-3 | Medium | Salary/address/phone exposed to same-company employees | Fixed |
| R1 | Medium | No rate limiting on non-auth endpoints | Fixed |
| I1 | Medium | One-time setup token logged in plaintext | Fixed |
| LOW-4 | Low | Email HTML injection via user-controlled name | Open |
| LOW-5 | Low | JWT algorithm not pinned; token in localStorage | Open |
| LOW-6 | Low | 500 handlers leak `error.message` | Fixed |
| E2 | Low | (same as LOW-6) | Fixed |
| B2 | Medium | Unreachable superadmin branches in admin controller | Open |
| INFO-7 | Info | Public `registerCompany` abuse potential | Open |
| I2 | Info | `DELETE /admin/removeAllowedIP` sends a request body | Open |
| P2 | Info | No max length caps on free-text fields | Open |

CORS configuration and authentication coverage were reviewed and found correct.

---

## 1. Findings — Full audit

### HIGH-1 — Spoofable `X-Forwarded-For` defeats brute-force protection and office-IP enforcement — FIXED
- `app.set("trust proxy", 1)` made Express derive `req.ip` from `X-Forwarded-For`,
  and `express-rate-limit` keys on `req.ip`.
- `getClientIP` (server/middleware/validateIP.js) read `x-forwarded-for` first and
  trusted it unconditionally.
- Impact: a client connecting directly could rotate `X-Forwarded-For` to bypass
  the 10/15-min login limiter (unlimited brute force) and, in `IP_ENFORCEMENT=strict`
  mode, spoof an allowed office IP to check in from anywhere.
- Fix: `trust proxy` is now only enabled when `TRUST_PROXY=true` (server/index.js),
  and `getClientIP` honors `X-Forwarded-For` only when the app is configured as
  behind a trusted proxy (server/middleware/validateIP.js). Documented in
  `server/.env.example`.
- Tests: `server/test/integration/validateIP.test.js` (new spoofing case).

### MEDIUM-2 — Login user enumeration via timing — FIXED
- `loginUser` returned `401` for unknown emails without running bcrypt; real
  accounts paid a ~50–150 ms compare, leaking account existence by timing.
- Fix: unknown emails now run `bcrypt.compare` against a fixed dummy hash before
  returning the generic 401 (server/controllers/authController.js).

### MEDIUM-3 — Salary/address/phone disclosed to same-company employees — FIXED
- `serializeUser` always returned `salary`, `address`, `phone`, and
  `canAccessUser` grants access to every same-company user, so any employee could
  fetch any colleague's salary via `/byId/getUser/:id` or `/byId/getUserByName/:name`.
- Fix: `serializeUser(user, requester)` only includes sensitive fields for the
  user themself, company admins, or superadmins (server/common/getUser.js).
- Tests: `server/test/integration/admin.test.js` (3 new cases).

### LOW-4 — Email HTML injection via user-controlled name — OPEN
- `server/utils/sendMail.js` interpolates `firstName`/`lastName` into the setup
  email HTML without escaping. A name containing HTML (set via admin-created
  users) could inject markup/phishing into company emails.
- Remediation: HTML-escape template variables and add a plain-text alternative.

### LOW-5 — JWT algorithm not pinned; token in localStorage — OPEN
- `server/utils/tokenUtils.js` signs with implicit HS256; `jwt.verify` does not
  pin `algorithms: ["HS256"]` or set an audience. `jsonwebtoken` v9 rejects
  `none`, so practical risk is low.
- The bearer token is stored in `localStorage` (theft on XSS) with a 5 h TTL and
  no refresh token; revocation happens only via the `version` bump on
  password/role change. Standard SPA tradeoff — document and keep the TTL short.
- Remediation: pin `algorithms`, add `issuer`; optionally move to an HttpOnly
  cookie with CSRF protection or add short-lived + refresh tokens.

### LOW-6 / E2 — 500 handlers leak `error.message` — FIXED
- `checkIn`, `checkOut`, `attendanceStatus`, `getUserById`, `getUserByName`,
  `getCompanyBySlug` returned raw `error.message` (e.g. Mongoose `CastError`
  details on malformed ObjectIds).
- Fix: all return generic 500 messages; details are logged server-side only.

### INFO-7 — Public `registerCompany` abuse — OPEN
- Unauthenticated `/auth/register` creates a tenant + admin (throttled at
  100/15-min/IP, now not bypassable). Mass registration fills the DB and inbox.
- Remediation: keep the limiter low, add a proof-of-work/captcha or require email
  verification before activation.

---

## 2. Findings — API security review

### 2.1 Missing authentication — PASS
Every private route is behind `authenticateToken`, which re-validates the JWT
signature, checks the user still exists, checks the token `version`, and
re-fetches role/company from the DB (never trusts JWT claims). Public endpoints
are only the intended ones: login, register, setup, server-time, health.
- Note: `GET /attend/server-time?slug=` publicly discloses a company's slug,
  timezone and open/closed state — low sensitivity, treat as public.

### 2.2 Missing authorization — PASS
`authorizeAdmin` / `authorizeSuperAdmin` derive role from the DB-fetched
`req.user.role`; `authorizeCompany` blocks suspended/deleted tenants and is
applied to all admin config routes.

### 2.3 Broken access control
#### B1 [High] — Employees could check in/out on behalf of colleagues — FIXED
`checkIn`/`checkOut` used `canAccessUser`, which grants access to all same-company
users, contrary to the "self or same-company admin" intent. A regular employee
could mark a late/absent colleague as present.
- Fix: new `canManageAttendance` (self / superadmin / same-company admin) used by
  `checkIn`, `checkOut`, `attendanceRecord`, `attendanceStatus`
  (server/common/company.js).
- Tests: `server/test/unit/company.test.js` + `server/test/integration/attendance.test.js`.

#### B2 [Medium] — Unreachable superadmin branches in admin controller — OPEN
`getUsers`/`addUser`/`editUser` contain superadmin paths (`?companyId=` / body
`companyId`) that are unreachable because `authorizeAdmin` blocks superadmins.
Not exploitable, but dead code; superadmins currently have no way to manage
tenant users via the API. Remediation: remove the dead branches or expose proper
superadmin user-management routes.

### 2.4 Insecure endpoints
#### I1 [Medium] — Setup token (account-takeover credential) logged in plaintext — FIXED
`/auth/setup/:token` carries a one-time credential in the URL, and the request
logger wrote `req.originalUrl` verbatim, persisting the token in server logs
(24 h TTL, one-time use). Anyone with log access could take over the account.
- Fix: the logger redacts the setup-token segment
  (server/index.js, `logUrl`).
- Note: the token is 32 random bytes, so it is not brute-forceable; the exposure
  was purely the logging.

#### I2 [Info] — `DELETE /admin/removeAllowedIP` sends a request body — OPEN
Some proxies/LBs strip DELETE bodies. Prefer passing the IP via query param.

### 2.5 Missing rate limiting
#### R1 [Medium] — No throttling outside /auth — FIXED
Only login/register were limited. Now a global per-IP limiter
(600 req/15 min, `RATE_LIMIT_GENERAL`) covers all other routes, skipping
`/health` and the auth endpoints (which keep their tighter limiters)
(server/index.js). Documented in `server/.env.example`.

### 2.6 Poor input validation — PASS (minor gaps)
Validation is consistent and effective: email/phone regexes, salary
`Number.isFinite && >= 0`, role whitelist, strong-password policy, ObjectId
format checks, and `escapeRegex` in `getUserByName`. Mongoose casting plus
regex validation neutralizes NoSQL operator injection.
- Gaps (open): no max length caps on `firstName/lastName/address/companyName`;
  no cap on `allowedRouterIPs` size.

### 2.7 Excessive data exposure
#### E1 [High] — Attendance records leaked colleagues' salary — FIXED
`attendanceRecord` returned `monthlySalary` and computed `netSalary` to any
same-company user. Restricting records/status access to self/admin/superadmin
(via `canManageAttendance`) closes the leak.
- Tests: `server/test/integration/attendance.test.js`.

### 2.8 CORS configuration — PASS
Allowlist from `CLIENT_ORIGIN` (exact-match, comma-separated), no wildcard, no
`credentials` (bearer-token auth, not cookies), methods restricted to
GET/POST/PUT/PATCH/DELETE. Non-allowlisted origins get no ACAO header.

---

## 3. Confirmed positives (no action needed)

- Token `version` check invalidates JWTs on password/role change.
- Middleware re-fetches role/company from the DB; JWT claims are not trusted.
- Generic login error message (no response-body enumeration).
- bcrypt (cost 10) for all passwords; strong-password policy enforced.
- `escapeRegex` in name-slug lookups; Mongoose casting blocks NoSQL injection.
- Fail-fast startup validation of `JWT_SECRET` (>= 32 chars) and `MONGO_URL`.
- Helmet security headers; CORS locked to configured origins.
- No `eval`/`child_process`/HTML-render sinks found anywhere in `server/`.
- No secrets committed; `.env.example` ships placeholders only.
- Atomic check-out guard (`findOneAndUpdate` on `checkOut: null`) prevents
  double check-out races; unique `{ employee, day }` index prevents double
  check-in.
- Company soft-delete; per-request correlation IDs; graceful shutdown.
- Admin scope checks everywhere a company admin can act on a user
  (`isSameCompany`), including edit/delete/resend-invite.

---

## 4. Recommended backlog

1. LOW-4: HTML-escape email template variables; add plain-text alternative.
2. LOW-5: pin `algorithms: ["HS256"]` on verify; add `issuer`; evaluate
   HttpOnly-cookie or short-lived + refresh token strategy.
3. B2: delete unreachable superadmin branches or add superadmin user
   management routes.
4. P2: enforce max lengths on `firstName`, `lastName`, `address`, `companyName`;
   cap `allowedRouterIPs`.
5. INFO-7: tighten `registerCompany` (lower limit, captcha, or email
   verification).
6. I2: move `removeAllowedIP` IP to a query parameter.
