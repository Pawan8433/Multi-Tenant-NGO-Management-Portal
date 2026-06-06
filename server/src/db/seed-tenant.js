// Seeds realistic dummy data into one or more EXISTING tenants (does NOT touch
// the ngos/users rows). Re-runnable: clears only the data tables for each
// tenant, then refills them.
//
// Usage:
//   node src/db/seed-tenant.js                      # seeds the two default tenants
//   node src/db/seed-tenant.js <tenantId> [<tenantId> ...]
import { pool } from './pool.js';

const DEFAULT_TENANTS = [
  { id: '728d1498-4acb-4bdf-851b-87bc482399da', label: 'modern',  currency: 'USD' },
  { id: 'ca85c48b-304d-44a2-b735-b44f3142d00d', label: 'hope',    currency: 'USD' },
];

const argTenants = process.argv.slice(2);
const TENANTS = argTenants.length
  ? argTenants.map((id, i) => ({ id, label: `tenant${i + 1}`, currency: 'USD' }))
  : DEFAULT_TENANTS;

// --- small helpers ---------------------------------------------------------
async function insert(table, row) {
  const keys = Object.keys(row);
  const [res] = await pool.execute(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
    keys.map((k) => row[k])
  );
  return res.insertId;
}

const FIRST = ['Aisha', 'Daniel', 'Maria', 'Wei', 'Fatima', 'James', 'Priya', 'Lucas', 'Olivia', 'Noah',
               'Emma', 'Liam', 'Sophia', 'Ethan', 'Ava', 'Mason', 'Isabella', 'Logan', 'Mia', 'Amir'];
const LAST = ['Khan', 'Owusu', 'Garcia', 'Chen', 'Al-Sayed', 'Murphy', 'Nair', 'Silva', 'Brooks', 'Patel',
              'Wilson', 'Johnson', 'Smith', 'Brown', 'Lee', 'Davis', 'Rossi', 'Haddad', 'Costa', 'Mwangi'];
const SKILLS = ['First aid', 'Logistics', 'Photography', 'Teaching', 'Fundraising', 'Driving', 'Cooking', 'IT support', 'Translation'];
const METHODS = ['cash', 'card', 'bank_transfer', 'cheque', 'online'];
const PURPOSES = ['General Fund', 'Education', 'Food Program', 'Health', 'Disaster Relief', 'Youth Program'];
const MSTATUS = ['active', 'active', 'active', 'inactive', 'pending'];

const pick = (arr, i) => arr[i % arr.length];

// Last 12 months as 'YYYY-MM' ending at the current month.
function lastMonths(n) {
  const out = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

async function clearTenant(t) {
  // Order matters only loosely thanks to FK cascades; this covers all data tables.
  for (const table of ['donations', 'events', 'volunteers', 'members', 'contacts', 'campaigns',
                        'membership_types', 'notifications', 'audit_logs', 'receipts',
                        'subscriptions', 'onboarding']) {
    await pool.execute(`DELETE FROM ${table} WHERE tenant_id = ?`, [t.id]);
  }
}

async function seedTenant(t, idx) {
  const off = idx * 7; // offset so tenants get different names/numbers
  await clearTenant(t);

  // Subscription + onboarding
  await insert('subscriptions', { tenant_id: t.id, plan: idx === 0 ? 'starter' : 'growth',
    status: 'active', amount: idx === 0 ? 29 : 99, started_at: '2025-01-01', renews_at: '2026-01-01' });
  await insert('onboarding', { tenant_id: t.id, completed: 1,
    steps: JSON.stringify({ create_organization: true, add_administrators: true, create_membership_types: true,
      import_members: true, create_first_event: true, configure_donations: true, complete: true }) });

  // Membership types
  const mtIds = [];
  for (const [name, fee, dur] of [['Standard', 25, 12], ['Premium', 75, 12], ['Lifetime', 500, 999], ['Student', 10, 12]]) {
    mtIds.push(await insert('membership_types', { tenant_id: t.id, name, fee, duration_months: dur, description: `${name} membership` }));
  }

  // Members
  const memberIds = [];
  const memberCount = 10 + idx * 2;
  for (let i = 0; i < memberCount; i++) {
    const fn = pick(FIRST, i + off);
    const ln = pick(LAST, i + off + 3);
    const month = pick(lastMonths(12), i);
    memberIds.push(await insert('members', {
      tenant_id: t.id,
      member_code: `M-${1000 + i + idx * 100}`,
      first_name: fn,
      last_name: ln,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
      phone: `+1 202 555 0${100 + i}`,
      membership_type_id: pick(mtIds, i),
      status: pick(MSTATUS, i),
      join_date: `${month}-12`,
    }));
  }

  // Contacts
  for (const [name, type, org] of [
    ['Global Giving Corp', 'partner', 'Global Giving'],
    ['Sarah Thompson', 'donor', null],
    ['Northwind Supplies', 'vendor', 'Northwind'],
    ['City Herald', 'media', 'City Herald'],
    ['Helping Hands Co', 'partner', 'Helping Hands'],
  ]) {
    await insert('contacts', { tenant_id: t.id, name, type, organization: org, status: 'active',
      email: `${name.split(' ')[0].toLowerCase()}@example.com`, phone: '+1 800 555 1000' });
  }

  // Volunteers
  const volunteerIds = [];
  for (let i = 0; i < 5; i++) {
    const fn = pick(FIRST, i + off + 5);
    const ln = pick(LAST, i + off + 8);
    volunteerIds.push(await insert('volunteers', {
      tenant_id: t.id, name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.v@example.com`, phone: `+1 202 555 03${10 + i}`,
      skills: `${pick(SKILLS, i)}, ${pick(SKILLS, i + 3)}`,
      availability: pick(['Weekends', 'Evenings', 'Flexible', 'Mornings'], i),
      emergency_contact: `${pick(FIRST, i)} ${ln} +1 202 555 04${10 + i}`,
      total_hours: 12 + i * 9.5,
      status: i === 4 ? 'inactive' : 'active',
    }));
  }

  // Events
  const eventIds = [];
  const events = [
    ['Annual Charity Gala', 'completed', '2025-11-15 18:00:00', 25000, 300, 'Grand Hall'],
    ['Community Food Drive', 'completed', '2026-02-08 09:00:00', 3000, 120, 'Community Center'],
    ['Spring Cleanup', 'completed', '2026-04-20 08:00:00', 1500, 80, 'Riverside Park'],
    ['Summer Youth Camp', 'upcoming', '2026-07-10 08:00:00', 18000, 150, 'Lincoln School'],
    ['Donor Appreciation Night', 'upcoming', '2026-09-05 19:00:00', 8000, 100, 'Skyline Lounge'],
  ];
  for (const [title, status, start, budget, max, venue] of events) {
    eventIds.push(await insert('events', { tenant_id: t.id, title, status, start_date: start,
      end_date: start, budget, max_participants: max, venue, location: 'Washington, DC',
      description: `${title} — organized by the team.` }));
  }

  // Event participants
  for (let i = 0; i < 6; i++) {
    const mid = pick(memberIds, i);
    await insert('event_participants', { tenant_id: t.id, event_id: pick(eventIds, i),
      member_id: mid, name: `Member ${mid}`, status: pick(['attended', 'attended', 'registered', 'no_show'], i) });
  }

  // Volunteer assignments
  for (let i = 0; i < 4; i++) {
    await insert('volunteer_assignments', { tenant_id: t.id, event_id: pick(eventIds, i),
      volunteer_id: pick(volunteerIds, i), role: pick(['Registration', 'Coordinator', 'Photographer', 'Team lead'], i),
      hours: 4 + i, attended: 1 });
  }

  // Campaigns
  const campIds = [];
  for (const [name, status, recip, opens, clicks] of [
    ['Year-End Appeal', 'sent', 1200, 540, 132],
    ['Spring Newsletter', 'sent', 860, 410, 95],
    ['Summer Invite', 'scheduled', 0, 0, 0],
  ]) {
    campIds.push(await insert('campaigns', { tenant_id: t.id, name, subject: name, body: 'Thank you for your support...',
      segment: 'all', status, recipients: recip, opens, clicks, unsubscribes: Math.floor(clicks / 20),
      scheduled_at: '2026-06-20 09:00:00' }));
  }

  // Donations — at least one per month for nice charts, plus extras
  const months = lastMonths(12);
  const donationIds = [];
  let dcount = 0;
  for (let i = 0; i < months.length; i++) {
    const perMonth = 1 + (i % 2); // 1 or 2 per month
    for (let j = 0; j < perMonth; j++) {
      const amount = 75 + ((i * 37 + j * 53 + off * 11) % 20) * 50; // 75..1025
      const mid = pick(memberIds, i + j);
      donationIds.push(await insert('donations', {
        tenant_id: t.id,
        donor_name: pick(FIRST, i + j + off) + ' ' + pick(LAST, i + j),
        member_id: mid,
        campaign_id: pick(campIds, i),
        amount,
        currency: t.currency,
        donation_date: `${months[i]}-${String(10 + j * 5).padStart(2, '0')}`,
        payment_method: pick(METHODS, i + j),
        purpose: pick(PURPOSES, i + j),
        recurring: (i + j) % 3 === 0 ? 1 : 0,
        status: i === months.length - 1 && j === 1 ? 'pending' : 'received',
      }));
      dcount++;
    }
  }

  // Receipts for the first few donations
  for (let i = 0; i < 4; i++) {
    await insert('receipts', { tenant_id: t.id, donation_id: donationIds[i],
      receipt_number: `RCP-${2025}-${String(1 + i + idx * 50).padStart(4, '0')}`,
      issued_date: `${months[i]}-15`, amount: 100 + i * 50, donor_name: `Donor ${i + 1}`,
      qr_token: `qr-${idx}-${i}-${Math.floor(100000 + Math.random() * 900000)}`,
      emailed: i % 2, status: 'issued' });
  }

  // Notifications + activity feed
  for (const [title, body, type] of [
    ['New donation received', 'A new gift was recorded', 'success'],
    ['New member joined', 'A member just registered', 'info'],
    ['Pending receipts', 'You have receipts awaiting issuance', 'warning'],
  ]) {
    await insert('notifications', { tenant_id: t.id, user_id: null, title, body, type });
  }
  for (const [action, entity] of [
    ['donation.created', 'donation'], ['member.created', 'member'],
    ['event.created', 'event'], ['volunteer.created', 'volunteer'],
  ]) {
    await insert('audit_logs', { tenant_id: t.id, actor_name: 'System', action, entity, entity_id: '1' });
  }

  return { members: memberIds.length, donations: dcount, events: eventIds.length, volunteers: volunteerIds.length };
}

async function main() {
  for (let i = 0; i < TENANTS.length; i++) {
    const t = TENANTS[i];
    const summary = await seedTenant(t, i);
    console.log(`✓ Seeded ${t.label} (${t.id}):`, summary);
  }
  await pool.end();
}

main().catch((err) => {
  console.error('Tenant seeding failed:', err.code || '', err.sqlMessage || err.message || err);
  process.exit(1);
});
