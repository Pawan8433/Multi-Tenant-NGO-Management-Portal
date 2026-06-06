import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../app/AuthContext.jsx';

function FullScreenLoader() {
  return (
    <Box sx={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

// Requires an authenticated session.
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

// Requires the session AND one of the given roles.
export function RoleRoute({ roles, children }) {
  const { user, loading, hasRole } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !hasRole(...roles)) return <Navigate to="/" replace />;
  return children;
}

// Keeps authenticated users out of the auth screens.
export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to={user.role === 'super_admin' ? '/superadmin/dashboard' : '/'} replace />;
  return children;
}

// Super Admin platform console only.
export function SuperAdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'super_admin') return <Navigate to="/dashboard" replace />;
  return children;
}

// NGO workspace. A non-impersonating super admin is bounced to their console.
export function NgoRoute({ children }) {
  const { user, loading, isImpersonating } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'super_admin' && !isImpersonating) return <Navigate to="/superadmin/dashboard" replace />;
  return children;
}
