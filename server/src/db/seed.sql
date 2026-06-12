-- ============================================================================
-- Demo seed data for ImpactHub.
-- The admin/user accounts (which need hashed passwords) are inserted by
-- src/db/seed.js. Everything else lives here. Fixed demo tenant id is used so
-- the data is reproducible.
--   tenant_id    = 11111111-1111-1111-1111-111111111111
--   workspace_id = 22222222-2222-2222-2222-222222222222
--
-- NOTE: foreign-key references between child tables (event_participants,
-- volunteer_assignments, receipts) use LAST_INSERT_ID() captured into @vars
-- instead of hardcoded ids, so the seed is correct regardless of the current
-- AUTO_INCREMENT value (fresh DB, re-runs, or managed providers like Aiven).
-- ============================================================================
SET @TENANT := '11111111-1111-1111-1111-111111111111';
SET @WORKSPACE := '22222222-2222-2222-2222-222222222222';

INSERT INTO ngos (tenant_id, workspace_id, name, registration_number, email, phone,
                  country, address, timezone, date_format, currency, contact_email, status)
VALUES (@TENANT, @WORKSPACE, 'Hope Foundation', 'NGO-2021-0457',
        'hello@hopefoundation.org', '+1 202 555 0142', 'United States',
        '500 Community Ave, Washington, DC', 'America/New_York', 'YYYY-MM-DD', 'USD',
        'hello@hopefoundation.org', 'active')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO subscriptions (tenant_id, plan, status, amount, started_at, renews_at)
VALUES (@TENANT, 'growth', 'active', 99.00, '2025-01-01', '2026-01-01');

INSERT INTO onboarding (tenant_id, steps, completed) VALUES
(@TENANT, JSON_OBJECT(
  'create_organization', true,
  'add_administrators', true,
  'create_membership_types', true,
  'import_members', true,
  'create_first_event', false,
  'configure_donations', false,
  'complete', false), 0);

INSERT INTO membership_types (tenant_id, name, fee, duration_months, description) VALUES
(@TENANT, 'Standard',  25.00, 12, 'Annual standard membership'),
(@TENANT, 'Premium',   75.00, 12, 'Annual premium membership with perks'),
(@TENANT, 'Lifetime', 500.00, 999, 'One-time lifetime membership'),
(@TENANT, 'Student',   10.00, 12, 'Discounted membership for students');
SET @mt := LAST_INSERT_ID();   -- first membership_type id

INSERT INTO members (tenant_id, member_code, first_name, last_name, email, phone, membership_type_id, status, join_date) VALUES
(@TENANT, 'M-1001', 'Aisha',   'Khan',      'aisha.khan@example.com',  '+1 202 555 0101', @mt+1, 'active',   '2025-02-10'),
(@TENANT, 'M-1002', 'Daniel',  'Owusu',     'daniel.o@example.com',    '+1 202 555 0102', @mt,   'active',   '2025-03-05'),
(@TENANT, 'M-1003', 'Maria',   'Garcia',    'maria.g@example.com',     '+1 202 555 0103', @mt,   'active',   '2025-04-18'),
(@TENANT, 'M-1004', 'Wei',     'Chen',      'wei.chen@example.com',    '+1 202 555 0104', @mt+2, 'active',   '2025-05-22'),
(@TENANT, 'M-1005', 'Fatima',  'Al-Sayed',  'fatima.a@example.com',    '+1 202 555 0105', @mt+3, 'pending',  '2025-09-01'),
(@TENANT, 'M-1006', 'James',   'Murphy',    'james.m@example.com',     '+1 202 555 0106', @mt+1, 'active',   '2025-10-12'),
(@TENANT, 'M-1007', 'Priya',   'Nair',      'priya.n@example.com',     '+1 202 555 0107', @mt,   'inactive', '2024-11-30'),
(@TENANT, 'M-1008', 'Lucas',   'Silva',     'lucas.s@example.com',     '+1 202 555 0108', @mt+1, 'active',   '2026-01-15');
SET @mem := LAST_INSERT_ID();  -- first member id

INSERT INTO contacts (tenant_id, name, email, phone, type, status, organization) VALUES
(@TENANT, 'Global Giving Corp', 'grants@globalgiving.org', '+1 800 555 1000', 'partner', 'active', 'Global Giving'),
(@TENANT, 'Sarah Thompson',     'sarah.t@example.com',     '+1 202 555 0201', 'donor',   'active', NULL),
(@TENANT, 'Northwind Supplies', 'sales@northwind.com',     '+1 202 555 0202', 'vendor',  'active', 'Northwind'),
(@TENANT, 'City Herald',        'news@cityherald.com',     '+1 202 555 0203', 'media',   'active', 'City Herald');

INSERT INTO volunteers (tenant_id, name, email, phone, skills, availability, emergency_contact, total_hours, status) VALUES
(@TENANT, 'Olivia Brooks', 'olivia.b@example.com', '+1 202 555 0301', 'First aid, Logistics', 'Weekends',  'Mark Brooks +1 202 555 0401', 48.5, 'active'),
(@TENANT, 'Noah Patel',    'noah.p@example.com',   '+1 202 555 0302', 'Photography, Social',  'Evenings',  'Ravi Patel +1 202 555 0402',  22.0, 'active'),
(@TENANT, 'Emma Wilson',   'emma.w@example.com',   '+1 202 555 0303', 'Teaching, Fundraising','Flexible',  'Joan Wilson +1 202 555 0403', 65.0, 'active'),
(@TENANT, 'Liam Johnson',  'liam.j@example.com',   '+1 202 555 0304', 'Driving, Setup',       'Mornings',  'Kate Johnson +1 202 555 0404', 12.5, 'inactive');
SET @vol := LAST_INSERT_ID();  -- first volunteer id

INSERT INTO events (tenant_id, title, description, venue, location, start_date, end_date, budget, max_participants, status) VALUES
(@TENANT, 'Annual Charity Gala', 'Flagship fundraising dinner', 'Grand Hall', 'Washington, DC', '2025-11-15 18:00:00', '2025-11-15 23:00:00', 25000.00, 300, 'completed'),
(@TENANT, 'Community Food Drive', 'Monthly food distribution', 'Community Center', 'Arlington, VA', '2026-02-08 09:00:00', '2026-02-08 14:00:00', 3000.00, 120, 'completed'),
(@TENANT, 'Spring Cleanup', 'Neighborhood cleanup day', 'Riverside Park', 'Alexandria, VA', '2026-04-20 08:00:00', '2026-04-20 12:00:00', 1500.00, 80, 'completed'),
(@TENANT, 'Summer Youth Camp', 'Educational summer program', 'Lincoln School', 'Washington, DC', '2026-07-10 08:00:00', '2026-07-24 17:00:00', 18000.00, 150, 'upcoming'),
(@TENANT, 'Donor Appreciation Night', 'Thank-you reception', 'Skyline Lounge', 'Washington, DC', '2026-09-05 19:00:00', '2026-09-05 22:00:00', 8000.00, 100, 'upcoming');
SET @ev := LAST_INSERT_ID();   -- first event id

INSERT INTO event_participants (tenant_id, event_id, member_id, name, status) VALUES
(@TENANT, @ev,   @mem,   'Aisha Khan', 'attended'),
(@TENANT, @ev,   @mem+1, 'Daniel Owusu', 'attended'),
(@TENANT, @ev,   @mem+2, 'Maria Garcia', 'no_show'),
(@TENANT, @ev+1, @mem+3, 'Wei Chen', 'attended'),
(@TENANT, @ev+1, @mem+5, 'James Murphy', 'attended'),
(@TENANT, @ev+2, @mem,   'Aisha Khan', 'attended');

INSERT INTO volunteer_assignments (tenant_id, event_id, volunteer_id, role, hours, attended) VALUES
(@TENANT, @ev,   @vol,   'Registration desk', 6.0, 1),
(@TENANT, @ev,   @vol+2, 'Auction coordinator', 8.0, 1),
(@TENANT, @ev+1, @vol+1, 'Photographer', 4.0, 1),
(@TENANT, @ev+2, @vol,   'Team lead', 4.5, 1);

INSERT INTO campaigns (tenant_id, name, subject, body, segment, status, scheduled_at, recipients, opens, clicks, unsubscribes) VALUES
(@TENANT, 'Year-End Appeal 2025', 'Help us finish the year strong', 'Dear friend, your support...', 'all', 'sent', '2025-12-01 10:00:00', 1200, 540, 132, 8),
(@TENANT, 'Spring Newsletter', 'What we achieved this spring', 'Highlights from the season...', 'donors', 'sent', '2026-03-15 09:00:00', 860, 410, 95, 3),
(@TENANT, 'Summer Camp Invite', 'Register for Summer Youth Camp', 'Spots are filling fast...', 'members', 'scheduled', '2026-06-20 08:00:00', 0, 0, 0, 0);
SET @camp := LAST_INSERT_ID(); -- first campaign id

INSERT INTO donations (tenant_id, donor_name, member_id, campaign_id, amount, currency, donation_date, payment_method, purpose, recurring, status) VALUES
(@TENANT, 'Sarah Thompson', NULL,   @camp, 500.00, 'USD', '2025-07-12', 'card',          'General Fund',   1, 'received'),
(@TENANT, 'Aisha Khan',     @mem,   @camp, 250.00, 'USD', '2025-08-03', 'online',        'Education',      0, 'received'),
(@TENANT, 'Global Giving',  NULL,   @camp, 5000.00,'USD', '2025-09-20', 'bank_transfer', 'Food Program',   0, 'received'),
(@TENANT, 'Daniel Owusu',   @mem+1, @camp, 120.00, 'USD', '2025-10-09', 'cash',          'General Fund',   1, 'received'),
(@TENANT, 'Maria Garcia',   @mem+2, @camp, 300.00, 'USD', '2025-11-15', 'card',          'Gala',           0, 'received'),
(@TENANT, 'Anonymous',      NULL,   @camp, 1000.00,'USD', '2025-12-05', 'online',        'Year-End',       0, 'received'),
(@TENANT, 'Wei Chen',       @mem+3, NULL,  750.00, 'USD', '2026-01-18', 'bank_transfer', 'Lifetime Gift',  0, 'received'),
(@TENANT, 'James Murphy',   @mem+5, @camp+1, 200.00,'USD','2026-02-22', 'card',          'Food Drive',     1, 'received'),
(@TENANT, 'Sarah Thompson', NULL,   @camp+1, 500.00,'USD','2026-03-11', 'online',        'Spring',         1, 'received'),
(@TENANT, 'Lucas Silva',    @mem+7, NULL,  90.00,  'USD', '2026-04-02', 'cash',          'General Fund',   0, 'received'),
(@TENANT, 'Priya Nair',     @mem+6, NULL,  150.00, 'USD', '2026-05-19', 'card',          'Cleanup',        0, 'received'),
(@TENANT, 'Emma Wilson',    NULL,   NULL,  60.00,  'USD', '2026-06-01', 'online',        'General Fund',   0, 'pending');
SET @don := LAST_INSERT_ID();  -- first donation id

INSERT INTO receipts (tenant_id, donation_id, receipt_number, issued_date, amount, donor_name, qr_token, emailed, status) VALUES
(@TENANT, @don,   'RCP-2025-0001', '2025-07-12', 500.00, 'Sarah Thompson', 'qr-0001-abc', 1, 'issued'),
(@TENANT, @don+1, 'RCP-2025-0002', '2025-08-03', 250.00, 'Aisha Khan',     'qr-0002-abc', 1, 'issued'),
(@TENANT, @don+2, 'RCP-2025-0003', '2025-09-20', 5000.00,'Global Giving',  'qr-0003-abc', 0, 'issued');

INSERT INTO notifications (tenant_id, user_id, title, body, type) VALUES
(@TENANT, NULL, 'New donation received', 'Sarah Thompson donated $500.00', 'success'),
(@TENANT, NULL, 'New member joined', 'Lucas Silva just registered', 'info'),
(@TENANT, NULL, 'Pending receipts', 'You have receipts awaiting issuance', 'warning');

INSERT INTO audit_logs (tenant_id, actor_name, action, entity, entity_id, created_at) VALUES
(@TENANT, 'System',        'donation.created', 'donation', '12', '2026-06-01 09:14:00'),
(@TENANT, 'System',        'member.created',   'member',   '8',  '2026-01-15 11:02:00'),
(@TENANT, 'Admin User',    'event.created',    'event',    '4',  '2026-05-30 16:40:00'),
(@TENANT, 'Admin User',    'volunteer.created','volunteer','3',  '2026-05-28 10:05:00');
