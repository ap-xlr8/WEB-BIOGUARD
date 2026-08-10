import { Link } from 'react-router-dom';
import { Check, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { ROUTES } from '../../constants';
import { useAuth } from '../../context';
import { pagoService } from '../../services';
import { PagoResponse } from '../../types';

export default function PagoExitoPage() {
  const { isAuthenticated, refreshPlan } = useAuth();
  const [pago, setPago] = useState<PagoResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const MAX_ATTEMPTS = 10;
  const INTERVAL_MS = 3000;

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    // Initial fetch of payment history
    pagoService
      .historial()
      .then((p) => setPago(p?.[0] ?? null))
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });

    // Polling for plan update
    let attempts = 0;
    pollingRef.current = setInterval(async () => {
        attempts++;
        try {
            await refreshPlan();
            // Si el plan cambió, se reflejará en el contexto. 
            // Como no tenemos el plan previo aquí fácil, simplemente hacemos polling un rato.
        } catch { /* continuar */ }
        if (attempts >= MAX_ATTEMPTS) {
            clearInterval(pollingRef.current!);
        }
    }, INTERVAL_MS);
    
    return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isAuthenticated, refreshPlan]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
        <Loader2 size={32} style={{ color: 'var(--color-blue)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const destino = isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN;

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
          background: 'rgba(0,230,118,0.1)', border: '2px solid rgba(0,230,118,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Check size={36} style={{ color: '#00e676' }} />
        </div>

        <span style={{
          fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: '#00e676', display: 'block', marginBottom: 8,
        }}>
          Retorno del procesador recibido
        </span>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 12 }}>
          {pago ? 'Pago registrado' : 'Verificación pendiente'}
        </h1>

        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', marginBottom: 24, lineHeight: 1.5, maxWidth: 360, margin: '0 auto 24px' }}>
          {pago ? 'El backend devolvió el registro más reciente de tu historial.' : 'No fue posible confirmar el pago desde el historial. Revisa tu facturación antes de reintentar.'}
        </p>

        {pago && (
          <div style={{
            background: 'rgba(45,156,255,0.04)', borderRadius: 14, padding: 16,
            marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10,
            fontSize: '0.85rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8E9CB8' }}>Monto</span>
              <span style={{ fontWeight: 600, color: '#F5F7FA' }}>${pago.monto} {pago.moneda}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8E9CB8' }}>Estado</span>
              <span style={{ color: '#00e676' }}>{pago.estado}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8E9CB8' }}>Método</span>
              <span style={{ color: '#F5F7FA', textTransform: 'capitalize' }}>{pago.metodoPago}</span>
            </div>
          </div>
        )}

        <Link to={destino} style={{
            width: '100%', padding: '14px 24px',
            background: 'var(--color-blue)',
            border: 'none', borderRadius: 8, color: '#fff', textDecoration: 'none',
            cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.95rem',
            fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s',
          }}>
            {isAuthenticated ? 'Ir al Dashboard' : 'Iniciar sesión'} <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
