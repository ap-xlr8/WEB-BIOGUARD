import { Link } from 'react-router-dom';
import { Sun, Moon, ShieldCheck, Activity, Lock, HeartPulse } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useTheme } from '../../context';
import { ROUTES } from '../../constants';
import styles from './AuthLayout.module.css';
import { RouteMetadata } from '../RouteMetadata';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.authLayout}>
      <RouteMetadata />
      <header className={styles.header}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          BioGuard
        </Link>
        <button className={styles.themeToggle} onClick={toggleTheme} aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <main className={styles.splitMain}>
        {/* Left Branding / Artwork Panel */}
        <div className={styles.brandPanel}>
          <div className={styles.brandBadge}>
            <ShieldCheck size={16} style={{ marginRight: 6 }} /> Acceso protegido
          </div>
          <h2 className={styles.brandTitle}>
            Tu histórico BioGuard en un solo lugar
          </h2>
          <p className={styles.brandSubtitle}>
            Consulta la información sincronizada por la aplicación móvil y administra pacientes, cuidadores, reportes y cuenta.
          </p>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><HeartPulse size={18} /></div>
              <div>
                <div className={styles.featureTitle}>Histórico sincronizado</div>
                <div className={styles.featureDesc}>La Web muestra lecturas reales que ya fueron recibidas por el backend.</div>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Activity size={18} /></div>
              <div>
                <div className={styles.featureTitle}>Tendencias y reportes</div>
                <div className={styles.featureDesc}>Analiza periodos, eventos y reportes autorizados por tu cuenta.</div>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Lock size={18} /></div>
              <div>
                <div className={styles.featureTitle}>Sesión controlada</div>
                <div className={styles.featureDesc}>Renovación segura, expiración por inactividad y validación de acceso en el backend.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card Panel */}
        <div className={styles.formPanel}>
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <Logo size={56} showText={false} />
            </div>
            <h1 className={styles.cardTitle}>{title}</h1>
            {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
            {children}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        Conexión protegida con HTTPS en producción. BioGuard &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
