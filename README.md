# ImpactHub — Multi-Tenant NGO Management Portal (SaaS)

A production-grade, multi-tenant SaaS for NGOs, charities, associations and
membership organizations. The platform has **two distinct experiences**:

1. **NGO Workspace** — each organization gets a fully isolated workspace with its
   own members, donations, volunteers, events, receipts, reports, campaigns,
   settings and administrators.
2. **Super Admin Portal** — a separate, cross-tenant platform console for
   operating the whole SaaS: an NGO directory, suspend/reactivate, impersonation,
   billing overview, platform analytics and a global audit log.

- **Frontend:** React (Vite) + Material UI v5 + React Router + TanStack Query + Recharts
- **Backend:** Node.js + Express + JWT auth + RBAC
- **Database:** MySQL 8 (strict per-tenant data isolation via `tenant_id`)

---

## Architecture at a glance

```
Ngo/
├─ server/          Express REST API (multi-tenant, RBAC, audit logging)
│  └─ src/
│     ├─ config/      env loading
│     ├─ db/          pool, schema.sql, seed.sql, migrate/seed + admin utilities
│     ├─ middleware/  auth, rbac, validation, error handling
│     ├─ utils/       jwt, password, ids, ApiError, tenant-scoped crud factory
│     ├─ modules/     one folder per domain (routes/controller/service)
│     │   ├─ auth, members, contacts, volunteers, events, donations,
│     │   │   receipts, campaigns, reports, admins, settings, dashboard,
│     │   │   audit, notifications
│     │   └─ admin/   ← cross-tenant Super Admin module (/api/admin/*)
│     └─ routes/      mounts every module router under /api
└─ client/          React single-page app
   └─ src/
      ├─ api/         axios client + per-domain endpoint modules (+ admin.api.js)
      ├─ app/         AuthContext (+ impersonation), ColorMode/theme, query client
      ├─ components/  reusable UI (DataTable, StatCard, PageHeader, dialogs, CrudPage)
      ├─ config/      nav.jsx (NGO) + superAdminNav.jsx (console)
      ├─ layouts/     AppLayout (NGO shell), AuthLayout, SuperAdminLayout (console)
      ├─ routes/      route table + Protected / Role / SuperAdmin / Ngo guards
      └─ pages/       one folder per NGO module + pages/superadmin/*
```

### Multi-tenancy model
- On registration the system generates a **`tenant_id`** and **`workspace_id`** (UUIDs).
- The JWT carries `tenant_id`, `user_id` and `role`.
- Every tenant-scoped query is filtered by the `tenant_id` taken **from the verified
  JWT only** — never from client input — enforced centrally in the CRUD data layer
  (`utils/crud.js`), so a handler cannot forget it.
- The **only** code that crosses tenants is the Super Admin module
  (`modules/admin/`), which is gated by `requireRole('super_admin')`.

### Roles (RBAC)
`super_admin` · `ngo_admin` · `staff` · `volunteer_manager` · `finance_manager`

Permissions are enforced on the backend (authoritative) and reflected in the UI.
- `super_admin` → the platform console (`/superadmin/*`); can manage every NGO.
- everyone else → their own NGO workspace, scoped to their `tenant_id`.

---

## Prerequisites
- Node.js 18+ (tested on 26)
- MySQL 8+ running locally (or a connection string to a managed instance)

---

## Quick start

### 1. Database

```bash
cd server
cp .env.example .env          # then edit DB_* values to match your MySQL
npm install
npm run db:migrate            # creates all base tables (schema.sql)
npm run db:migrate:superadmin # adds NGO management fields for the admin portal
npm run db:seed               # loads one demo NGO + all role accounts + sample data
```

> `db:migrate` / `db:seed` execute `src/db/schema.sql` and `src/db/seed.sql`, so you
> can also run those SQL files by hand. `db:migrate:superadmin` is idempotent and
> safe to re-run.

### 2. Backend

```bash
cd server
npm run dev                   # http://localhost:4000  (API under /api)
```

### 3. Frontend

```bash
cd client
cp .env.example .env          # VITE_API_URL defaults to http://localhost:4000/api
npm install
npm run dev                   # http://localhost:5173
```

---

## Demo logins (from the seed — all use password `Password123!`)

| Role               | Email                                | Lands on              |
|--------------------|--------------------------------------|-----------------------|
| Super Admin        | `superadmin@hopefoundation.org`      | `/superadmin/dashboard` |
| NGO Admin          | `admin@hopefoundation.org`           | `/dashboard`          |
| Finance Manager    | `finance@hopefoundation.org`         | `/dashboard`          |
| Volunteer Manager  | `volunteers@hopefoundation.org`      | `/dashboard`          |
| Staff              | `staff@hopefoundation.org`           | `/dashboard`          |

On login, `super_admin` users are redirected to the platform console; everyone
else goes to their NGO dashboard.

---

## Super Admin Portal (`/superadmin/*`)

A separate layout and navigation (dark "platform console" theme), available only
to `super_admin`:

| Screen             | Route                       |
|--------------------|-----------------------------|
| Dashboard          | `/superadmin/dashboard`     |
| NGO Directory      | `/superadmin/ngos`          |
| NGO Profile        | `/superadmin/ngos/:id`      |
| Platform Analytics | `/superadmin/analytics`     |
| Subscriptions      | `/superadmin/billing`       |
| Audit Logs         | `/superadmin/audit-logs`    |
| System Settings    | `/superadmin/settings`      |

**NGO Directory** — server-side search/sort/pagination, status filter, and a
per-row actions menu: View Profile · Suspend · Reactivate · Impersonate · Delete.

**Suspend / Reactivate** — sets `ngos.status` and stores a `suspension_reason`.
Suspended (and expired / soft-deleted) NGOs are **blocked at login** with the reason.

**Impersonation** — the super admin can enter an NGO workspace. The backend issues
a short-lived token scoped to that tenant's admin; the UI stashes the super admin's
own session, shows a *"Currently impersonating NGO XYZ"* banner, and offers
one-click **Exit impersonation**. Every impersonation is audit-logged.

**GDPR delete** — soft delete by default (`deleted_at` set, login blocked, data
retained); an explicit checkbox performs a permanent cascade delete.

---

## API surface

### Tenant-scoped (under `/api`, JWT-protected, scoped by `tenant_id`)

| Module        | Base path     |
|---------------|---------------|
| Auth          | `/auth`       |
| Dashboard     | `/dashboard`  |
| Members       | `/members`    |
| Contacts      | `/contacts`   |
| Volunteers    | `/volunteers` |
| Events        | `/events`     |
| Donations     | `/donations`  |
| Receipts      | `/receipts`   |
| Campaigns     | `/campaigns`  |
| Reports       | `/reports`    |
| Administrators| `/admins`     |
| Settings      | `/settings`   |
| Audit logs    | `/audit-logs` |
| Notifications | `/notifications` |

Generic resource endpoints follow REST conventions:
`GET /` (list, with `?search=&page=&pageSize=&sort=&order=` + filters),
`GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.

### Platform / Super Admin (under `/api/admin`, `super_admin` only, cross-tenant)

| Method & path                          | Purpose                              |
|----------------------------------------|--------------------------------------|
| `GET    /admin/dashboard`              | Platform totals + charts             |
| `GET    /admin/billing`               | Plan counts + monthly/annual revenue |
| `GET    /admin/audit-logs`            | Global audit trail (all tenants)     |
| `GET    /admin/ngos`                  | NGO directory (search/sort/paginate) |
| `GET    /admin/ngos/:id`              | NGO profile + stats + admins         |
| `PUT    /admin/ngos/:id/status`       | Suspend / reactivate (`{status, suspension_reason}`) |
| `POST   /admin/ngos/:id/impersonate`  | Issue an impersonation token         |
| `DELETE /admin/ngos/:id`              | Soft delete (`?permanent=true` = hard) |

---

## Database

Base schema lives in `server/src/db/schema.sql`. Every tenant-scoped table carries
an indexed `tenant_id`. The Super Admin portal adds these management fields to
`ngos` (applied via `db:migrate:superadmin`):

```sql
status            ENUM('active','suspended','trial','expired')  -- 'expired' added
plan_name         VARCHAR(100)
billing_cycle     ENUM('monthly','annual')
renewal_date      DATE
suspension_reason TEXT
website           VARCHAR(255)
deleted_at        DATETIME NULL        -- soft delete
-- + indexes on status and deleted_at
```

---

## Scripts & admin utilities (run from `server/`)

| Command | What it does |
|---------|--------------|
| `npm run db:migrate` | Create all base tables from `schema.sql` |
| `npm run db:migrate:superadmin` | Add NGO management fields (idempotent) |
| `npm run db:seed` | Reset the demo tenant and load sample data + role accounts |
| `node src/db/seed-tenant.js [tenantId ...]` | Fill an **existing** tenant with realistic dummy data (members, donations, events…). Defaults to the two sample tenants; clears only data tables, never `ngos`/`users`. |
| `node src/db/set-password.js <email> [password]` | Set & verify a user's password (default `Password123!`) |
| `node src/db/create-superadmin.js [email] [password] [orgName]` | Remove any account with that email + its NGO, then create a fresh `super_admin` in a new workspace |

---

## Security notes
- Passwords hashed with bcrypt; JWT access + refresh tokens (with single-flight refresh on the client).
- `helmet`, CORS allow-list, and rate limiting on auth endpoints.
- Every sensitive action (and all Super Admin actions) is written to `audit_logs`.
- All queries are parameterized; tenant scoping is enforced in the data layer.
- Suspended / expired / soft-deleted organizations are blocked at login.
