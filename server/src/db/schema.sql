-- ============================================================================
-- ImpactHub — Multi-Tenant NGO Management Portal
-- MySQL 8+ schema. Every tenant-scoped table carries `tenant_id` (indexed).
-- The `ngos` table IS the tenant; everything else references its tenant_id.
-- ============================================================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- Tenants (NGOs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ngos (
  id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id           CHAR(36) NOT NULL UNIQUE,
  workspace_id        CHAR(36) NOT NULL UNIQUE,
  name                VARCHAR(200) NOT NULL,
  registration_number VARCHAR(120),
  email               VARCHAR(190) NOT NULL,
  phone               VARCHAR(50),
  country             VARCHAR(100),
  address             VARCHAR(500),
  logo_url            VARCHAR(500),
  timezone            VARCHAR(60)  NOT NULL DEFAULT 'UTC',
  date_format         VARCHAR(20)  NOT NULL DEFAULT 'YYYY-MM-DD',
  currency            VARCHAR(10)  NOT NULL DEFAULT 'USD',
  contact_email       VARCHAR(190),
  website             VARCHAR(255),
  status              ENUM('active','suspended','trial','expired') NOT NULL DEFAULT 'trial',
  plan_name           VARCHAR(100) NOT NULL DEFAULT 'Free',
  billing_cycle       ENUM('monthly','annual') NOT NULL DEFAULT 'monthly',
  renewal_date        DATE,
  suspension_reason   TEXT,
  deleted_at          DATETIME NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_ngos_status (status),
  KEY idx_ngos_deleted (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Users / administrators (login accounts) — RBAC roles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id          CHAR(36) NOT NULL,
  name               VARCHAR(160) NOT NULL,
  email              VARCHAR(190) NOT NULL,
  password_hash      VARCHAR(255) NOT NULL,
  role               ENUM('super_admin','ngo_admin','staff','volunteer_manager','finance_manager')
                       NOT NULL DEFAULT 'ngo_admin',
  status             ENUM('active','invited','suspended') NOT NULL DEFAULT 'active',
  email_verified     TINYINT(1) NOT NULL DEFAULT 0,
  verification_token VARCHAR(120),
  reset_token        VARCHAR(120),
  reset_expires      DATETIME,
  last_login         DATETIME,
  avatar_url         VARCHAR(500),
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_tenant_email (tenant_id, email),
  KEY idx_users_tenant (tenant_id),
  CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Membership types
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS membership_types (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id       CHAR(36) NOT NULL,
  name            VARCHAR(120) NOT NULL,
  fee             DECIMAL(12,2) NOT NULL DEFAULT 0,
  duration_months INT NOT NULL DEFAULT 12,
  description     VARCHAR(400),
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_mtype_tenant (tenant_id),
  CONSTRAINT fk_mtype_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Members
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
  id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id          CHAR(36) NOT NULL,
  member_code        VARCHAR(40),
  first_name         VARCHAR(100) NOT NULL,
  last_name          VARCHAR(100) NOT NULL,
  email              VARCHAR(190),
  phone              VARCHAR(50),
  membership_type_id BIGINT,
  status             ENUM('active','inactive','suspended','pending') NOT NULL DEFAULT 'active',
  join_date          DATE,
  renewal_date       DATE,
  address            VARCHAR(500),
  notes              TEXT,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_members_tenant (tenant_id),
  KEY idx_members_tenant_status (tenant_id, status),
  CONSTRAINT fk_members_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Contacts (CRM)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contacts (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id    CHAR(36) NOT NULL,
  name         VARCHAR(160) NOT NULL,
  email        VARCHAR(190),
  phone        VARCHAR(50),
  type         ENUM('donor','partner','vendor','media','general') NOT NULL DEFAULT 'general',
  status       ENUM('active','inactive') NOT NULL DEFAULT 'active',
  organization VARCHAR(190),
  address      VARCHAR(500),
  notes        TEXT,
  last_login   DATETIME,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_contacts_tenant (tenant_id),
  CONSTRAINT fk_contacts_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Volunteers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS volunteers (
  id                BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id         CHAR(36) NOT NULL,
  name              VARCHAR(160) NOT NULL,
  email             VARCHAR(190),
  phone             VARCHAR(50),
  skills            VARCHAR(500),
  availability      VARCHAR(200),
  emergency_contact VARCHAR(200),
  total_hours       DECIMAL(10,2) NOT NULL DEFAULT 0,
  status            ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_volunteers_tenant (tenant_id),
  CONSTRAINT fk_volunteers_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id        CHAR(36) NOT NULL,
  title            VARCHAR(200) NOT NULL,
  description      TEXT,
  venue            VARCHAR(200),
  location         VARCHAR(200),
  start_date       DATETIME,
  end_date         DATETIME,
  budget           DECIMAL(12,2) NOT NULL DEFAULT 0,
  max_participants INT NOT NULL DEFAULT 0,
  status           ENUM('draft','upcoming','ongoing','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_events_tenant (tenant_id),
  KEY idx_events_tenant_date (tenant_id, start_date),
  CONSTRAINT fk_events_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Event participants (members attending events)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_participants (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id  CHAR(36) NOT NULL,
  event_id   BIGINT NOT NULL,
  member_id  BIGINT,
  name       VARCHAR(160),
  status     ENUM('registered','attended','no_show','cancelled') NOT NULL DEFAULT 'registered',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ep_tenant (tenant_id),
  KEY idx_ep_event (event_id),
  CONSTRAINT fk_ep_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE,
  CONSTRAINT fk_ep_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Volunteer assignments (volunteers assigned to events + hours/attendance)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id    CHAR(36) NOT NULL,
  event_id     BIGINT NOT NULL,
  volunteer_id BIGINT NOT NULL,
  role         VARCHAR(120),
  hours        DECIMAL(10,2) NOT NULL DEFAULT 0,
  attended     TINYINT(1) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_va_tenant (tenant_id),
  KEY idx_va_event (event_id),
  CONSTRAINT fk_va_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE,
  CONSTRAINT fk_va_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CONSTRAINT fk_va_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Campaigns (email)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id     CHAR(36) NOT NULL,
  name          VARCHAR(200) NOT NULL,
  subject       VARCHAR(255),
  body          MEDIUMTEXT,
  segment       VARCHAR(120) NOT NULL DEFAULT 'all',
  status        ENUM('draft','scheduled','sending','sent') NOT NULL DEFAULT 'draft',
  scheduled_at  DATETIME,
  recipients    INT NOT NULL DEFAULT 0,
  opens         INT NOT NULL DEFAULT 0,
  clicks        INT NOT NULL DEFAULT 0,
  unsubscribes  INT NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_campaigns_tenant (tenant_id),
  CONSTRAINT fk_campaigns_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Donations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS donations (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id      CHAR(36) NOT NULL,
  donor_name     VARCHAR(190) NOT NULL,
  member_id      BIGINT,
  contact_id     BIGINT,
  campaign_id    BIGINT,
  amount         DECIMAL(14,2) NOT NULL,
  currency       VARCHAR(10) NOT NULL DEFAULT 'USD',
  donation_date  DATE NOT NULL,
  payment_method ENUM('cash','card','bank_transfer','cheque','online','other') NOT NULL DEFAULT 'cash',
  purpose        VARCHAR(200),
  recurring      TINYINT(1) NOT NULL DEFAULT 0,
  notes          TEXT,
  status         ENUM('received','pending','refunded') NOT NULL DEFAULT 'received',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_don_tenant (tenant_id),
  KEY idx_don_tenant_date (tenant_id, donation_date),
  KEY idx_don_campaign (campaign_id),
  CONSTRAINT fk_don_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Receipts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS receipts (
  id             BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id      CHAR(36) NOT NULL,
  donation_id    BIGINT NOT NULL,
  receipt_number VARCHAR(60) NOT NULL,
  issued_date    DATE NOT NULL,
  amount         DECIMAL(14,2) NOT NULL,
  donor_name     VARCHAR(190),
  qr_token       VARCHAR(120),
  emailed        TINYINT(1) NOT NULL DEFAULT 0,
  status         ENUM('issued','void') NOT NULL DEFAULT 'issued',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_receipt_number (tenant_id, receipt_number),
  KEY idx_receipts_tenant (tenant_id),
  CONSTRAINT fk_receipts_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE,
  CONSTRAINT fk_receipts_donation FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Subscriptions (SaaS billing per tenant)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id  CHAR(36) NOT NULL,
  plan       ENUM('free','starter','growth','enterprise') NOT NULL DEFAULT 'free',
  status     ENUM('active','past_due','cancelled','trialing') NOT NULL DEFAULT 'trialing',
  amount     DECIMAL(12,2) NOT NULL DEFAULT 0,
  started_at DATE,
  renews_at  DATE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_subs_tenant (tenant_id),
  CONSTRAINT fk_subs_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Reports (saved/generated report metadata)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id    CHAR(36) NOT NULL,
  type         ENUM('donation','member','volunteer','event','financial') NOT NULL,
  title        VARCHAR(200) NOT NULL,
  params       JSON,
  generated_by BIGINT,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_reports_tenant (tenant_id),
  CONSTRAINT fk_reports_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Notifications (per user)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id  CHAR(36) NOT NULL,
  user_id    BIGINT,
  title      VARCHAR(200) NOT NULL,
  body       VARCHAR(500),
  type       ENUM('info','success','warning','error') NOT NULL DEFAULT 'info',
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notif_tenant (tenant_id),
  KEY idx_notif_user (user_id),
  CONSTRAINT fk_notif_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Activity / audit log (sensitive actions, dashboard feed)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id  CHAR(36) NOT NULL,
  user_id    BIGINT,
  actor_name VARCHAR(160),
  action     VARCHAR(80) NOT NULL,
  entity     VARCHAR(80),
  entity_id  VARCHAR(80),
  meta       JSON,
  ip         VARCHAR(60),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_tenant (tenant_id),
  KEY idx_audit_tenant_time (tenant_id, created_at),
  CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Onboarding progress (one row per tenant)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onboarding (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  tenant_id  CHAR(36) NOT NULL UNIQUE,
  steps      JSON,
  completed  TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_onb_tenant FOREIGN KEY (tenant_id) REFERENCES ngos(tenant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- Indexing strategy:
--   * Every tenant-scoped table leads with an index on tenant_id so the mandatory
--     tenant filter is always index-backed.
--   * Composite indexes (tenant_id, status) and (tenant_id, date) accelerate the
--     most common list filters (status chips, date-range donation/event queries).
