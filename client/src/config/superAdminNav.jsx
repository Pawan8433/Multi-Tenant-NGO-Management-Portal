import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

// Sidebar for the Super Admin (platform) console — separate from NGO nav.
export const superAdminNav = [
  { label: 'Dashboard', path: '/superadmin/dashboard', icon: <SpaceDashboardRoundedIcon /> },
  { label: 'NGO Directory', path: '/superadmin/ngos', icon: <ApartmentRoundedIcon /> },
  { label: 'Platform Analytics', path: '/superadmin/analytics', icon: <InsightsRoundedIcon /> },
  { label: 'Subscriptions', path: '/superadmin/billing', icon: <CreditCardRoundedIcon /> },
  { label: 'Audit Logs', path: '/superadmin/audit-logs', icon: <FactCheckRoundedIcon /> },
  { label: 'System Settings', path: '/superadmin/settings', icon: <TuneRoundedIcon /> },
];

export const superAdminLookup = superAdminNav.reduce((a, i) => ({ ...a, [i.path]: i.label }), {});
