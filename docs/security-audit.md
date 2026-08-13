# Security Audit — onTime Attendance System

Audit date: 2026-08-07
Auditor: Senior Application Security Engineer (assisted)
Scope: Full `server/` and `client/` codebases (routes, controllers, middleware,
models, utils, common, config) plus authentication, authorization, rate
limiting, CORS, logging, data exposure, and frontend storage/XSS surface.

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
| F1 | Medium | JWT bearer token stored in `localStorage` | Open |
| S1 | Medium | Bearer token logged to browser console | Fixed |
| S2 | Low | Debug `console.log` of API payloads | Fixed |
| A1 | Medium | Client falls back to `http://localhost:5000` in production | Fixed |
| DEP-1 | High | `nodemailer` 7.x SMTP/header injection advisories (runtime) | Fixed |
| DEP-2 | High | `brace-expansion` DoS (server, dev-only) | Fixed |
| DEP-3 | Moderate | `uuid` via `node-cron` 3.x (server, not exploitable) | Fixed |
| DEP-4 | High | `react-router` 7.12–8.2 RSC-mode CSRF (client, not exploitable) | Accepted |
| DEP-5 | High | `brace-expansion` / `js-yaml` (client, dev-only) | Fixed |
| DEP-6 | Moderate | `postcss` `sourceMappingURL` (client, build-time) | Fixed |
| DEP-7 | Info | Unused `tz` dependency (client) | Removed |

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
  and password-reset email HTML without escaping. A name containing HTML (set
  via admin-created users) could inject markup/phishing into company emails.
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
are only the intended ones: login, register, setup, forgot-password,
reset-password, server-time, health.
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
#### I1 [Medium] — Setup/reset tokens (account-takeover credentials) logged in plaintext — FIXED
`/auth/setup/:token` and `/auth/reset-password/:token` carry a one-time
credential in the URL, and the request logger wrote `req.originalUrl` verbatim,
persisting the token in server logs (24 h / 1 h TTL, one-time use). Anyone with
log access could take over the account.
- Fix: the logger redacts the token segment of both paths
  (server/index.js, `logUrl`).
- Note: the tokens are 32 random bytes, so they are not brute-forceable; the
  exposure was purely the logging.

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

## 3. Findings — Frontend security review

### 3.1 Unsafe user input handling — PASS
No `dangerouslySetInnerHTML`, `innerHTML`, `document.write`, `eval`, or
`new Function` anywhere in `client/src`. All user data renders as React text
nodes (auto-escaped); inputs are controlled components; the server validates
authoritatively. Login/Setup forms use `type="password"` + `autoComplete`.

### 3.2 Local storage secrets
#### F1 [Medium] — JWT bearer token in `localStorage` — OPEN
The session token is persisted in `localStorage` (Pages/Login.jsx:47,
Pages/Setup.jsx:60); any XSS on the origin can exfiltrate it. No XSS sink
currently exists, TTL is 5 h, and there is no refresh token. Covered by LOW-5
(see Section 1). Mitigations in place: the one-time setup/reset tokens are kept
only in `sessionStorage` and stripped from the URL (Pages/Setup.jsx:24-35,
Pages/ResetPassword.jsx); passwords
are never persisted; `role`/`id`/`slug` are UI hints only (server re-derives
authority).

### 3.3 XSS vulnerabilities — PASS
No DOM/HTML-injection sinks found. React's default escaping plus controlled
inputs covers names, emails, attendance data, and company names.

### 3.4 Sensitive data exposure
#### S1 [Medium] — Bearer token logged to browser console — FIXED
`console.log(localStorage.getItem("token"))` was a debug leftover in
Components/Timezone.jsx:44, exposing the live session token to anyone at the
console. Removed.
#### S2 [Low] — Debug `console.log` of API payloads — FIXED
`console.log` of fetched/saved office-schedule data in
Components/OfficeTimings.jsx:47,112. Not sensitive, but removed as leftover
debugging.
#### S3 — Salary/address/phone — PASS
Only rendered for self/admin because the API now returns those fields only to
self/admin (server MEDIUM-3 / E1 fixes).

### 3.5 Insecure API communication
#### A1 [Medium] — Production fallback to `http://localhost:5000` — FIXED
`lib/config.js` resolved to plaintext `http://localhost:5000` when
`VITE_API_URL` was unset, which would be mixed content on an HTTPS host. The
build-time guard in `vite.config.js` already fails a production build without
`VITE_API_URL`; the insecure fallback has now been removed entirely so
production always uses `VITE_API_URL` and dev uses the same-origin Vite proxy.
- All requests use `${API_URL}` with `Authorization: Bearer`; no API keys or
  secrets are baked into the client; transport security is deployment-managed.

---

## 5. Findings — Dependency security review

### 5.1 Vulnerable libraries — `npm audit`
**Server (was 4: 2 high, 2 moderate) → 0 remaining**
| Package | Ver | Sev | Fix applied |
|---|---|---|---|
| `nodemailer` | 7.0.13 | High | Upgraded to 9.0.5. SMTP command injection (`envelope.size`), CRLF injection (EHLO/HELO, `List-*`), OAuth2 TLS-validation bypass, SSRF via `raw` option. Not directly reachable in our usage (plain `createTransport`+`sendMail`, env host, no `raw`/`jsonTransport`), but fixed to be safe. |
| `brace-expansion` | 5.0.7 | High | `npm audit fix` (transitive via eslint→minimatch, dev-only DoS). |
| `uuid` via `node-cron` | 3.0.3 | Moderate | `node-cron` upgraded to 4.6.0 (drop-in for our `cron.schedule` usage; removes the uuid dependency). |

**Client (was 5: 4 high, 1 moderate) → 2 high remain (accepted)**
| Package | Ver | Sev | Status |
|---|---|---|---|
| `react-router` / `react-router-dom` | 7.18.2 | High | **Accepted.** GHSA-qwww-vcr4-c8h2 is an RSC-mode CSRF bypass; this app is a plain Vite SPA (no RSC/framework mode) so it is unreachable. The only non-breaking "fix" npm offers is a downgrade to 7.11.0, which would lose months of 7.x patches — not worth it. Revisit when migrating to the `react-router` v8 package. |
| `brace-expansion` | 1.1.16 | High | Fixed (transitive via eslint-plugin-react→minimatch, dev-only). |
| `js-yaml` | 4.3.0 | High | Fixed (transitive via eslint→@eslint/eslintrc, dev-only, quadratic CPU). |
| `postcss` | 8.5.20 | Moderate | Fixed to 8.5.26 (build-time `sourceMappingURL`). |

### 5.2 Outdated packages (majors behind — not security-driven)
- **Server:** express 4→5, mongoose 8→9, bcryptjs 2→3, body-parser 1→2, dotenv 16→17, express-rate-limit 7→8.
- **Client:** react 18→19, vite 6→8, tailwindcss 3→4, react-day-picker 9→10, tailwind-merge 2→3, lucide-react 0.468→1.30, eslint 9→10, @vitejs/plugin-react 4→6.
- Treat the framework upgrades (React 19, Vite 8, Express 5, Mongoose 9) as a dedicated project, not incidental changes.

### 5.3 Dangerous dependencies
- `tz@0.1.1` (client) was declared but never imported — removed (smaller supply-chain surface).
- No malicious or abandoned install-time packages found. Postinstall scripts only: `esbuild` (platform binary), `mongodb-memory-server` (test binary), `ljharb-monorepo-symlink-test` (test helper) — all standard/benign.

### 5.4 Supply chain risks
- ✅ Lockfiles committed for server and client → deterministic `npm ci` in CI; integrity hashes detect tampering.
- ⚠️ No `npm audit` gate in CI. Add `npm audit --audit-level=high` to the CI workflow (and Dependabot) so new vulnerabilities fail the build.
- Semver `^` ranges allow drift; lockfiles pin actual resolution. Use `overrides` for transitive vulns with no direct fix (none needed today).

---

## 6. Confirmed positives (no action needed)

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

## 7. Recommended backlog

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
7. F1/LOW-5: migrate from `localStorage` bearer token to an HttpOnly cookie
   (with CSRF protection) or short-lived + refresh tokens.
8. DEP-4: migrate from `react-router-dom` to the `react-router` v8 package to
   clear the RSC-mode advisory and pick up ongoing patches.
9. Add `npm audit --audit-level=high` to CI and enable Dependabot.
10. Framework-major upgrades (React 19, Vite 8, Express 5, Mongoose 9) as a
    dedicated effort.
