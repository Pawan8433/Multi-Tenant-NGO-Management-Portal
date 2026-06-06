import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute, RoleRoute, SuperAdminRoute, NgoRoute } from './routes/guards.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import SuperAdminLayout from './layouts/SuperAdminLayout.jsx';

import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import VerifyEmail from './pages/auth/VerifyEmail.jsx';

import Dashboard from './pages/Dashboard.jsx';
import Members from './pages/Members.jsx';
import MemberProfile from './pages/MemberProfile.jsx';
import Contacts from './pages/Contacts.jsx';
import Volunteers from './pages/Volunteers.jsx';
import Events from './pages/Events.jsx';
import Donations from './pages/Donations.jsx';
import Receipts from './pages/Receipts.jsx';
import Finances from './pages/Finances.jsx';
import Campaigns from './pages/Campaigns.jsx';
import Reports from './pages/Reports.jsx';
import Website from './pages/Website.jsx';
import Settings from './pages/Settings.jsx';
import Administrators from './pages/Administrators.jsx';
import Account from './pages/Account.jsx';
import HelpCenter from './pages/HelpCenter.jsx';
import Onboarding from './pages/Onboarding.jsx';
import NotFound from './pages/NotFound.jsx';

import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard.jsx';
import NgoDirectoryPage from './pages/superadmin/NgoDirectoryPage.jsx';
import NgoProfilePage from './pages/superadmin/NgoProfilePage.jsx';
import PlatformAnalyticsPage from './pages/superadmin/PlatformAnalyticsPage.jsx';
import SubscriptionsPage from './pages/superadmin/SubscriptionsPage.jsx';
import AdminAuditLogsPage from './pages/superadmin/AuditLogsPage.jsx';
import SystemSettingsPage from './pages/superadmin/SystemSettingsPage.jsx';

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route element={<PublicOnlyRoute><AuthLayout /></PublicOnlyRoute>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Super Admin platform console */}
      <Route element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
        <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/superadmin/ngos" element={<NgoDirectoryPage />} />
        <Route path="/superadmin/ngos/:id" element={<NgoProfilePage />} />
        <Route path="/superadmin/analytics" element={<PlatformAnalyticsPage />} />
        <Route path="/superadmin/billing" element={<SubscriptionsPage />} />
        <Route path="/superadmin/audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="/superadmin/settings" element={<SystemSettingsPage />} />
      </Route>

      {/* NGO workspace */}
      <Route element={<NgoRoute><AppLayout /></NgoRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/:id" element={<MemberProfile />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/volunteers" element={<Volunteers />} />
        <Route path="/events" element={<Events />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/receipts" element={<Receipts />} />
        <Route path="/finances" element={<Finances />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/website" element={<Website />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/administrators"
          element={<RoleRoute roles={['ngo_admin']}><Administrators /></RoleRoute>}
        />
        <Route path="/account" element={<Account />} />
        <Route path="/help" element={<HelpCenter />} />
      </Route>

      <Route path="*" element={<NotFound />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
