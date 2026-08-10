import { useState, FormEvent, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../../components/ui';
import { AuthLayout } from '../../components/layout';
import { useAuth } from '../../context';
import { ROUTES } from '../../constants';
import { LoginWebRequest } from '../../types';
import styles from './Auth.module.css';
import { getErrorMessage } from '../../utils/errors';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  const [form, setForm] = useState<LoginWebRequest>({ correo: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginWebRequest>>({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [codeLogging, setCodeLogging] = useState(!!code);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.rol === 'administrador' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD, { replace: true });
      return;
    }
    if (!code) return;
    setCodeLogging(false);
    setApiError('El código QR de paciente se utiliza exclusivamente en la aplicación móvil.');
  }, [code, isAuthenticated, navigate, user?.rol]);

  if (isLoading || codeLogging) return <LoadingSpinner />;
  if (isAuthenticated) return null;

  const validate = () => {
    const e: Partial<LoginWebRequest> = {};
    if (!form.correo) e.correo = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.correo)) e.correo = 'Correo inválido';
    if (!form.password) e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError('');
    try {
      const res = await login(form);
      if (res.requires2FA) {
        navigate(`${ROUTES.CONFIRMAR_CORREO}?correo=${encodeURIComponent(form.correo)}&mode=2fa`, { replace: true });
        return;
      }
      navigate(res.rol === 'administrador' ? ROUTES.ADMIN_DASHBOARD : ROUTES.DASHBOARD, { replace: true });
    } catch (err: unknown) {
      setApiError(getErrorMessage(err, 'Credenciales incorrectas'));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Bienvenido" subtitle="Ingresa tus credenciales para acceder al panel">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {apiError && <div className={styles.errorBox}>{apiError}</div>}

        <Input
          label="Correo electrónico" type="email" placeholder="tu@correo.com"
          icon={<Mail size={18} />} value={form.correo}
          onChange={(e) => setForm({ ...form, correo: e.target.value })}
          error={errors.correo} autoComplete="username" name="email-field"
        />

        <div style={{ textAlign: 'right', marginTop: -10 }}>
          <Link to={ROUTES.RECUPERAR_PASSWORD}>¿Olvidaste tu contraseña?</Link>
        </div>

        <Input
          label="Contraseña" type="password" placeholder="........"
          icon={<Lock size={18} />} value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password} autoComplete="current-password" name="pass-field"
        />

        <div className={styles.actions}>
          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Iniciar Sesión
          </Button>
        </div>

        <div className={styles.registerLink}>
          ¿No tienes cuenta? <Link to={ROUTES.REGISTRO}>Regístrate aquí</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
