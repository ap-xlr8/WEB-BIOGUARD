import React, { useState, useEffect } from 'react';
import { Logo, Input, Button, Card, toast } from '../../components/ui';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { authService } from '../../services/authService';
import styles from './Auth.module.css';
import { getErrorMessage } from '../../utils/errors';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const t = searchParams.get('token') || '';
    setToken(t);
    if (!t) {
      toast.error('Token de recuperación no válido o ausente.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Token no válido.');
      return;
    }
    if (!nuevaPassword) {
      toast.error('Ingresa tu nueva contraseña.');
      return;
    }
    if (nuevaPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, nuevaPassword });
      toast.success('Contraseña actualizada correctamente. Redirigiendo...');
      setTimeout(() => navigate(ROUTES.LOGIN), 2500);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Error al restablecer la contraseña.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <Card style={{ maxWidth: 400, width: '100%', padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Logo size={40} showText={false} />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 12 }}>Restablecer Contraseña</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Ingresa tu nueva contraseña para recuperar el acceso.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Nueva contraseña
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Confirmar contraseña
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button fullWidth size="lg" loading={loading} disabled={!token}>
            Restablecer Contraseña
          </Button>
        </form>
      </Card>
    </div>
  );
}
