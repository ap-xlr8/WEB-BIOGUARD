import { Link } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../constants';

export default function PagoCanceladoPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg-primary)', padding: 24,
    }}>
      <div style={{
        maxWidth: 480, width: '100%', background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)', borderRadius: 8, padding: 40,
        textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        <div style={{
          width: 76, height: 76, borderRadius: '50%',
          background: 'rgba(255,77,79,0.1)', border: '2px solid rgba(255,77,79,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <X size={36} style={{ color: '#ff4d4f' }} />
        </div>

        <span style={{
          fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: '#ff4d4f', display: 'block', marginBottom: 8,
        }}>
          Pago cancelado
        </span>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 12 }}>
          No se completó <span style={{ color: '#ff4d4f' }}>el pago</span>
        </h1>

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginBottom: 24, lineHeight: 1.5, maxWidth: 360, margin: '0 auto 24px' }}>
          El flujo no se completó en BioGuard. Revisa el historial del proveedor antes de iniciar un nuevo intento.
        </p>

        <Link to={ROUTES.LICENCIAMIENTOS} style={{
            width: '100%', padding: '14px 24px',
            background: 'var(--color-blue)',
            border: 'none', borderRadius: 8, color: '#fff', textDecoration: 'none',
            cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.95rem',
            fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}>
            Volver a planes <ArrowLeft size={18} />
        </Link>
      </div>
    </div>
  );
}
