import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { ROUTES } from '../../constants';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandCol}>
          <div className={styles.logoRow}>
            <Logo size={32} showText={false} decorative />
            <span className={styles.brandTitle}>BioGuard</span>
          </div>
          <p className={styles.brandDesc}>
            Plataforma de apoyo preventivo para consultar señales fisiológicas e historial sincronizado desde el ecosistema BioGuard.
          </p>
          <div className={styles.noticeBadge}>
            Monitoreo indirecto de biomarcadores. BioGuard no sustituye el diagnóstico clínico profesional.
          </div>
        </div>

        <div className={styles.linksGrid}>
          <div className={styles.linkCol}>
            <h5 className={styles.colTitle}>Plataforma</h5>
            <Link to={ROUTES.HOME} className={styles.link}>Inicio</Link>
            <Link to={ROUTES.CARACTERISTICAS} className={styles.link}>Características</Link>
            <Link to={ROUTES.LICENCIAMIENTOS} className={styles.link}>Planes & Precios</Link>
            <Link to={ROUTES.STATUS} className={styles.link}>Estado del Sistema</Link>
          </div>

          <div className={styles.linkCol}>
            <h5 className={styles.colTitle}>Soporte & Info</h5>
            <Link to={ROUTES.FAQ} className={styles.link}>Preguntas Frecuentes</Link>
            <Link to={ROUTES.CONTACTO} className={styles.link}>Contacto Directo</Link>
            <Link to={ROUTES.NOSOTROS} className={styles.link}>Sobre Nosotros</Link>
            <Link to={ROUTES.BLOG} className={styles.link}>Recursos</Link>
          </div>

          <div className={styles.linkCol}>
            <h5 className={styles.colTitle}>Legal & Privacidad</h5>
            <Link to={ROUTES.TERMINOS} className={styles.link}>Términos de Servicio</Link>
            <Link to={ROUTES.PRIVACIDAD} className={styles.link}>Política de Privacidad</Link>
            <Link to={ROUTES.COOKIES} className={styles.link}>Política de Cookies</Link>
            <Link to={ROUTES.AVISO_LEGAL} className={styles.link}>Aviso Legal</Link>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p>&copy; {new Date().getFullYear()} BioGuard. Proyecto tecnológico de monitoreo preventivo.</p>
        </div>
      </div>
    </footer>
  );
}
