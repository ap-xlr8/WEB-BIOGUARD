import { Cookie } from 'lucide-react';
import { PublicLayout } from '../../components/layout';
import styles from './Public.module.css';

export default function CookiesPage() {
  return (
    <PublicLayout>
      <div className={styles.content}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}><Cookie size={28} /></div>
          <h1>Política de Cookies</h1>
          <p>Información sobre el almacenamiento estrictamente necesario para operar BioGuard.</p>
        </div>
        <article className={styles.legalText}>
          <h2>Uso actual</h2>
          <p>BioGuard utiliza una cookie de renovación de sesión protegida con HttpOnly, Secure y SameSite. El navegador no permite que el código JavaScript lea su contenido.</p>
          <h2>Preferencias locales</h2>
          <p>El tema visual y la información mínima de la sesión se conservan localmente en el dispositivo. Los tokens de acceso no se guardan en almacenamiento persistente del navegador.</p>
          <h2>Analítica y publicidad</h2>
          <p>La versión actual no instala cookies de publicidad ni seguimiento de terceros. Si esto cambia, la política y el mecanismo de consentimiento deberán actualizarse antes del despliegue.</p>
        </article>
      </div>
    </PublicLayout>
  );
}
