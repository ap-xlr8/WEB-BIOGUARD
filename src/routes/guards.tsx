import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context';
import { LoadingSpinner } from '../components/ui';
import { APP_PERMISSIONS, AppPermission, hasAnyPermission, hasPermission, normalizeRole } from '../auth/authorization';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function AdminRoute() {
  const { isAuthenticated, isLoading, isAccessLoading, access } = useAuth();

  if (isLoading || isAccessLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasPermission(access, APP_PERMISSIONS.ADMIN_PANEL)) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export function PermissionRoute({ anyOf }: { anyOf: readonly AppPermission[] }) {
  const { isAuthenticated, isLoading, isAccessLoading, access } = useAuth();

  if (isLoading || isAccessLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasAnyPermission(access, anyOf)) {
    const destination = hasPermission(access, APP_PERMISSIONS.ADMIN_PANEL)
      ? '/admin/dashboard'
      : '/ajustes';
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading, isAccessLoading, user, access } = useAuth();

  if (isLoading || isAccessLoading) return <LoadingSpinner />;
  if (isAuthenticated) {
    const role = access?.rol ?? normalizeRole(user?.rol);
    return <Navigate to={role === 'administrador' ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
