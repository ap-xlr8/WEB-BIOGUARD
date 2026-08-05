import { useState, FormEvent, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../../components/ui';
import { AuthLayout } from '../../components/layout';
import { useAuth } from '../../context';
import { authService } from '../../services';
import { ROUTES, TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../../constants';
import { LoginWebRequest } from '../../types';
import styles from './Auth.module.css';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
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
      navigate(ROUTES.DASHBOARD, { replace: true });
      return;
    }
    if (!code) return;
    (async () => {
      try {
        const res = await authService.loginCodigo(code);
        localStorage.setItem(TOKEN_KEY, res.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify({ token: res.accessToken, userId: res.userId, nombre: res.nombre, rol: res.rol, plan: '' }));
        navigate(ROUTES.DASHBOARD, { replace: true });
      } catch {
        setCodeLogging(false);
        setApiError('Código QR inválido o expirado');
      }
    })();
  }, [code, isAuthenticated, navigate]);

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
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err: any) {
      setApiError(err?.message || 'Credenciales incorrectas');
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Bienvenido" subtitle="Ingresa tus credenciales para acceder al panel">
      <form className={styles.form} onSubmit={handleSubmit} noValidate autoComplete="off">
        {apiError && <div className={styles.errorBox}>{apiError}</div>}

        <Input
          label="Correo electrónico" type="email" placeholder="tu@correo.com"
          icon={<Mail size={18} />} value={form.correo}
          onChange={(e) => setForm({ ...form, correo: e.target.value })}
          error={errors.correo} autoComplete="username" name="email-field"
        />

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
