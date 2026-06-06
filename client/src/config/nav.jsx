import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import ContactsRoundedIcon from '@mui/icons-material/ContactsRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import HelpCenterRoundedIcon from '@mui/icons-material/HelpCenterRounded';

// Single source of truth for the sidebar, breadcrumbs and route titles.
export const navSections = [
  {
    heading: 'Overview',
    items: [{ label: 'Dashboard', path: '/', icon: <DashboardRoundedIcon /> }],
  },
  {
    heading: 'People',
    items: [
      { label: 'Members', path: '/members', icon: <GroupsRoundedIcon /> },
      { label: 'Contacts', path: '/contacts', icon: <ContactsRoundedIcon /> },
      { label: 'Volunteers', path: '/volunteers', icon: <VolunteerActivismRoundedIcon /> },
    ],
  },
  {
    heading: 'Programs',
    items: [
      { label: 'Events', path: '/events', icon: <EventRoundedIcon /> },
      { label: 'Donations', path: '/donations', icon: <FavoriteRoundedIcon /> },
      { label: 'Receipts', path: '/receipts', icon: <ReceiptLongRoundedIcon /> },
      { label: 'Finances', path: '/finances', icon: <AccountBalanceRoundedIcon /> },
    ],
  },
  {
    heading: 'Engagement',
    items: [
      { label: 'Email Campaigns', path: '/campaigns', icon: <MailRoundedIcon /> },
      { label: 'Reports', path: '/reports', icon: <BarChartRoundedIcon /> },
      { label: 'Website', path: '/website', icon: <LanguageRoundedIcon /> },
    ],
  },
  {
    heading: 'Workspace',
    items: [
      { label: 'Settings', path: '/settings', icon: <SettingsRoundedIcon /> },
      { label: 'Account', path: '/account', icon: <PersonRoundedIcon /> },
      { label: 'Help Center', path: '/help', icon: <HelpCenterRoundedIcon /> },
    ],
  },
];

// Flattened lookup for breadcrumb titles.
export const navLookup = navSections
  .flatMap((s) => s.items)
  .reduce((acc, i) => ({ ...acc, [i.path]: i.label }), {});
