import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Heart,
  Lock,
  CreditCard,
  Settings,
  LogOut,
  Crown,
  MessageSquare,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useAuth } from '../../context';
import { ROUTES } from '../../constants';
import styles from './Sidebar.module.css';
import { APP_PERMISSIONS, AppPermission, hasPermission } from '../../auth/authorization';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { to: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Panel', permissions: [APP_PERMISSIONS.PATIENT_CREATE, APP_PERMISSIONS.PATIENT_READ, APP_PERMISSIONS.ALERT_READ] },
  { to: ROUTES.SALUD, icon: Heart, label: 'Salud', permissions: [APP_PERMISSIONS.HEALTH_SUMMARY] },
  { to: ROUTES.SEGURIDAD, icon: Lock, label: 'Seguridad', permissions: [APP_PERMISSIONS.ACCOUNT_SESSIONS] },
  { to: ROUTES.FACTURACION, icon: CreditCard, label: 'Facturación', permissions: [APP_PERMISSIONS.BILLING_MANAGE] },
  { to: ROUTES.SOPORTE, icon: MessageSquare, label: 'Soporte', permissions: [APP_PERMISSIONS.ACCOUNT_PROFILE] },
] satisfies Array<{ to: string; icon: typeof LayoutDashboard; label: string; permissions: AppPermission[] }>;

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, access, logout } = useAuth();
  const visibleItems = navItems.filter((item) =>
    item.permissions.some((permission) => hasPermission(access, permission)));
  const isAdmin = hasPermission(access, APP_PERMISSIONS.ADMIN_PANEL);

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Logo size={30} />
        </div>

        <nav className={styles.sidebarNav}>
          <span className={styles.sidebarSection}>Enterprise Health</span>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.DASHBOARD}
              onClick={onClose}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <item.icon className={styles.navIcon} />
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <span className={styles.sidebarSection} style={{ marginTop: 20 }}>Administración</span>
              <NavLink
                to={ROUTES.ADMIN_DASHBOARD}
                onClick={onClose}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <ShieldAlert className={styles.navIcon} />
                Panel Admin
              </NavLink>
              <NavLink
                to={ROUTES.ADMIN_USUARIOS}
                onClick={onClose}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <Users className={styles.navIcon} />
                Usuarios
              </NavLink>
              <NavLink
                to={ROUTES.ADMIN_TICKETS}
                onClick={onClose}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <MessageSquare className={styles.navIcon} />
                Tickets
              </NavLink>
            </>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          {(access?.plan?.nombre || user?.plan) && (
            <div className={styles.planBadge}>
              <Crown size={16} />
              Plan {access?.plan?.nombre || user?.plan}
            </div>
          )}
          {hasPermission(access, APP_PERMISSIONS.ACCOUNT_PROFILE) && (
            <NavLink
              to={ROUTES.AJUSTES}
              onClick={onClose}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              style={{ marginBottom: 4 }}
            >
              <Settings className={styles.navIcon} />
              Ajustes
            </NavLink>
          )}
          <button className={styles.logoutBtn} onClick={logout}>
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
