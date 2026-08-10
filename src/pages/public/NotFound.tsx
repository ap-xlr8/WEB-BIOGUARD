import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { PublicLayout } from '../../components/layout';
import { ROUTES } from '../../constants';
import styles from './Public.module.css';

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <div className={styles.content} style={{ textAlign: 'center' }}>
        <SearchX size={42} aria-hidden="true" style={{ color: 'var(--color-blue)', marginBottom: 16 }} />
        <h1 style={{ fontSize: '1.8rem', marginBottom: 8 }}>Página no encontrada</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 24 }}>La dirección solicitada no existe o cambió.</p>
        <Link to={ROUTES.HOME} className={styles.primaryLink}>Volver al inicio</Link>
      </div>
    </PublicLayout>
  );
}
