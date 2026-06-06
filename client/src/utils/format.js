import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(relativeTime);

export const money = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    Number(value || 0)
  );

export const moneyExact = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value || 0));

export const number = (value) => new Intl.NumberFormat('en-US').format(Number(value || 0));

export const date = (value) => (value ? dayjs(value).format('MMM D, YYYY') : '—');
export const dateTime = (value) => (value ? dayjs(value).format('MMM D, YYYY h:mm A') : '—');
export const fromNow = (value) => (value ? dayjs(value).fromNow() : '');

export const initials = (name = '') =>
  name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';

export const titleCase = (s = '') =>
  s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const roleLabel = (role) =>
  ({
    super_admin: 'Super Admin',
    ngo_admin: 'NGO Admin',
    staff: 'Staff',
    volunteer_manager: 'Volunteer Manager',
    finance_manager: 'Finance Manager',
  }[role] || titleCase(role || ''));
