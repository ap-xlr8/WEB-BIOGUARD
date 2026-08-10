import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context';
import styles from './AppLayout.module.css';
import { RouteMetadata } from '../RouteMetadata';
import { ConnectionBanner } from '../ConnectionBanner';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Panel Principal',
  '/salud': 'Análisis Clínico y Reportes',
  '/seguridad': 'Centro de Seguridad',
  '/facturacion': 'Centro de Facturación',
  '/ajustes': 'Ajustes',
};

const PLAN_REFRESH_MS = 30000;

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { refreshPlan } = useAuth();
  const title = PAGE_TITLES[location.pathname] || 'BioGuard';

  useEffect(() => {
    refreshPlan();
    const interval = setInterval(refreshPlan, PLAN_REFRESH_MS);
    const onFocus = () => refreshPlan();
    const onVisibilityChange = () => {
      if (!document.hidden) refreshPlan();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [refreshPlan]);

  return (
    <div className={styles.appLayout}>
      <RouteMetadata />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={styles.main}>
        <Header title={title} onMenuToggle={() => setSidebarOpen(true)} />
        <ConnectionBanner />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
