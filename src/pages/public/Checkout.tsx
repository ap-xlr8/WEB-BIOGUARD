import { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Logo } from '../../components/ui/Logo';
import { Button, Card } from '../../components/ui';
import { useAuth } from '../../context';
import { ROUTES } from '../../constants';
import { PlanResponse } from '../../types';
import { pagoService } from '../../services';

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { plan?: PlanResponse } | null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const plan = state?.plan;

  if (!plan) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)' }}>
        <Card>
          <p style={{ marginBottom: 16 }}>No se ha seleccionado un plan.</p>
          <Link to={ROUTES.LICENCIAMIENTOS} style={{ display: 'inline-flex', padding: '10px 16px', borderRadius: 8, background: 'var(--color-blue)', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Ver planes disponibles</Link>
        </Card>
      </div>
    );
  }

  const price = plan.precio;
  const periodLabel = '/mes';

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await pagoService.crearSesion({ planNombre: plan.nombre });
      if (res?.sesionUrl) {
        const checkoutUrl = new URL(res.sesionUrl);
        if (checkoutUrl.protocol !== 'https:' || checkoutUrl.hostname !== 'checkout.stripe.com') {
          throw new Error('Proveedor de pago no válido');
        }
        window.location.assign(checkoutUrl.toString());
        return;
      }
      // Gratis o plan activado sin Stripe
      navigate(ROUTES.CONFIGURACION_COMPLETADA, { state: { plan } });
    } catch {
      setError('No fue posible iniciar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)',
        padding: 24,
      }}
    >
      <Card style={{ maxWidth: 480, width: '100%', padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}>
          <Logo size={48} showText={false} decorative />
        </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            BioGuard
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Pasarela de Pago Segura
          </p>
        </div>

        <div
          style={{
            background: 'var(--color-bg-tertiary)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontWeight: 600, marginBottom: 4 }}>Plan {plan.nombre}</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
            {plan.descripcion}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Suscripción</span>
            <span>Mensual</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
            <span>${price} {plan.precioMoneda}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-cyan)' }}>
              ${price} {plan.precioMoneda}
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{periodLabel}</span>
            </span>
          </div>
        </div>

        {plan.nombre !== 'Gratis' && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
              Método de Pago
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-cyan)', background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Tarjeta de Crédito / Débito (Stripe)</span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(0, 230, 118, 0.1)', color: 'var(--color-emerald)', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>Recomendado</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(255,77,79,0.1)',
            border: '1px solid rgba(255,77,79,0.3)',
            color: '#ff4d4f',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 16,
            fontSize: '0.85rem',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Button fullWidth size="lg" loading={loading} onClick={handlePay}>
            {plan.nombre === 'Gratis' ? 'Activar Plan Gratis' : 'Pagar con Stripe'}
          </Button>
          <Link to={ROUTES.LICENCIAMIENTOS} style={{ minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 700 }}>Cancelar y volver</Link>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 16 }}>
          Pago procesado en la sesión segura del proveedor configurado
        </p>
      </Card>
    </div>
  );
}
