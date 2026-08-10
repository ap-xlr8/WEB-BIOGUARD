import React, { useState } from 'react';
import { Logo, Input, Button, Card, toast } from '../../components/ui';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { authService } from '../../services/authService';
import styles from './Auth.module.css';
import { getErrorMessage } from '../../utils/errors';

export default function ForgotPasswordPage() {
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo) {
      toast.error('Por favor, ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword({ correo });
      toast.success('Si el correo está registrado, recibirás un link de recuperación.');
      setTimeout(() => navigate(ROUTES.LOGIN), 3000);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Error al procesar la solicitud.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <Card style={{ maxWidth: 400, width: '100%', padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Logo size={40} showText={false} />
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 12 }}>Recuperar Contraseña</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            Ingresa tu correo para recibir instrucciones de recuperación.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Correo electrónico
            </label>
            <Input
              type="email"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <Button fullWidth size="lg" loading={loading}>
            Enviar Correo de Recuperación
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem' }}>
          <Link to={ROUTES.LOGIN} style={{ color: 'var(--color-cyan)', textDecoration: 'none' }}>
            Volver a Iniciar Sesión
          </Link>
        </div>
      </Card>
    </div>
  );
}
