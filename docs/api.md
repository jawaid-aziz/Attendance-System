# API Reference

Base URL: `http://localhost:5000` (dev). Auth headers:

```
Authorization: Bearer <jwt>
```

**Roles:** `employee`, `admin`, `superadmin`. Every protected endpoint also
enforces company isolation — an `admin` can only read/write records within
their own company; a `superadmin` operates across tenants.

**Errors** are `{ "message": "..." }` with a JSON body. Unhandled failures
return `500 { "message": "Internal server error" }`. Each response carries an
`X-Request-Id` header that is also written to the server logs.

## Health

### `GET /health`
Liveness/readiness probe. Returns `200` when MongoDB is connected.

```json
{ "status": "ok", "db": "connected", "uptime": 1234 }
```

## Authentication

### `POST /auth/register`
Create a company + its admin. Rate-limited (see `RATE_LIMIT_AUTH`).

```json
{
  "companyName": "Acme Corp",
  "totalEmployees": 25,
  "timezone": "Asia/Karachi",
  "adminFirstName": "Ada",
  "adminLastName": "Lovelace",
  "adminEmail": "ada@acme.test"
}
```

`201` → `{ message, emailFailed, company: { id, name, slug }, admin: { id, email, setupLink? } }`.
`setupLink` is returned only when the email failed (`emailFailed: true`).

### `POST /auth/login`
```json
{ "email": "ada@acme.test", "password": "secret", "slug": "acme-corp" }
```
`slug` is optional; if provided the account must belong to that tenant.
`200` → `{ message, token, slug, user }`. Wrong credentials return a generic
`401` (no user enumeration).

### `POST /auth/setup/:token`
Complete onboarding from the emailed one-time link. Body: `{ "password": "..." }`
(must be ≥8 chars with a letter and a number). Returns a session token.

### `POST /auth/change-password`
Auth. Body: `{ "currentPassword", "newPassword" }`. Bumps the token `version`,
invalidating all previously issued JWTs.

## Attendance

### `GET /attend/server-time`
Public. `?slug=<company>` → server time in the company's timezone plus whether
now is within office hours:

```json
{ "serverTime": "2026-08-07 04:24:50", "timezone": "Asia/Karachi", "isAllowedTime": false }
```

### `POST /attend/check-in/:employeeId` — Auth
Check the employee in (self or a same-company admin). Enforces office hours
and (optionally) IP. Upserts a single row per employee per day; a sweeper
"Absent" row is claimed as a late check-in.

### `POST /attend/check-out/:employeeId` — Auth
Check the employee out. Statuses: `Checked Out on Time`, `Late Check-Out`,
`Check Out before Time`, `No Check-Out`.

### `GET /attend/status/:employeeId` — Auth
`{ "checkedIn": bool, "checkedOut": bool }` for today.

### `GET /attend/records/:employeeId?year=YYYY&month=M` — Auth
Monthly report. `month` is 1–12. Returns:

```json
{
  "records": [{ "id", "date", "day", "checkIn", "checkOut", "checkInstatus", "checkOutstatus", "deductions", "isActive" }],
  "availableYears": [2026],
  "totalDeductions": 100,
  "monthlySalary": 60000,
  "netSalary": 59900
}
```

## Users / company (shared)

### `GET /byId/getUser/:id` — Auth
Self, same-company member, or superadmin. Returns the serialized user.

### `GET /byId/getUserByName/:name` — Auth
Resolve a `first-last` name slug (no raw id in URLs) within the same company.

### `GET /byId/company/:slug` — Auth
Company name/slug for the dashboard. Members of the company or superadmins.

## Admin (`/admin`)

All admin routes require the `admin` role (plus `authorizeCompany` where the
company context is needed).

| Method & path | Body / notes |
| --- | --- |
| `POST /admin/add` | `{ firstName, lastName, email, phone, salary, address, role }` (role: `admin`\|`employee`). Creates user + setup token, emails the link. |
| `POST /admin/resend-invite/:id` | Regenerate + re-email a setup link. |
| `PUT /admin/edit/:id` | Update fields; `password` optional (validated); bumps token version. |
| `DELETE /admin/delete/:id` | Deletes the user + attendance rows in a transaction. Refuses self-deletion and the company's last admin. |
| `GET /admin/user` | Employee list with today's attendance status (single aggregation). |
| `GET /admin/getTime` / `POST /admin/updateTime` | Read / update company timezone. |
| `GET /admin/getDeductions` / `POST /admin/updateDeductions` | Read / update `{ deductionEnabled, deductionRate }`. |
| `GET /admin/getAllowedIP` / `POST /admin/addAllowedIP` / `DELETE /admin/removeAllowedIP` | Manage `allowedRouterIPs`. |
| `GET /admin/getOfficeTiming` | Office schedule (employees may read this too). |
| `POST /admin/saveOfficeTiming` | Save the weekly schedule (`{ Monday: { isOpen, startTime, endTime }, ... }`). |

## Superadmin (`/superadmin`)

All routes require the `superadmin` role.

| Method & path | Notes |
| --- | --- |
| `GET /superadmin/companies` | List companies (non-deleted). |
| `GET /superadmin/companies/:id` | Company details + its users. |
| `POST /superadmin/companies` | Create a company (admin email + name required, setup email sent). |
| `PATCH /superadmin/companies/:id/status` | Set `active` / `suspended` (deleted is terminal). |
| `DELETE /superadmin/companies/:id` | Hard-delete a company. |
| `GET /superadmin/admins` | List superadmins. |
| `POST /superadmin/invite-superadmin` | Invite a new superadmin. |
