import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { Button, Input, LoadingSpinner } from '../../components/ui';
import { AuthLayout } from '../../components/layout';
import { useAuth } from '../../context';
import { ROUTES } from '../../constants';
import { RegisterWebRequest } from '../../types';
import styles from './Auth.module.css';
import { getErrorMessage, getErrorStatus } from '../../utils/errors';

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const [form, setForm] = useState<RegisterWebRequest>({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    correo: '',
    password: '',
    planNombre: 'Gratis',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated) {
    window.location.replace(ROUTES.DASHBOARD);
    return null;
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.nombre.trim()) {
      e.nombre = 'El nombre es obligatorio';
    } else if (form.nombre.length > 100) {
      e.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    if (!form.apellidoPaterno.trim()) {
      e.apellidoPaterno = 'El apellido paterno es obligatorio';
    } else if (form.apellidoPaterno.length > 100) {
      e.apellidoPaterno = 'El apellido paterno no puede exceder 100 caracteres';
    }

    if (form.apellidoMaterno && form.apellidoMaterno.length > 100) {
      e.apellidoMaterno = 'El apellido materno no puede exceder 100 caracteres';
    }

    if (!form.correo.trim()) {
      e.correo = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(form.correo)) {
      e.correo = 'Correo electrónico inválido';
    }

    if (!form.password) {
      e.password = 'La contraseña es obligatoria';
    } else if (form.password.length < 8 || form.password.length > 16) {
      e.password = 'La contraseña debe tener entre 8 y 16 caracteres';
    } else if (!/[A-Z]/.test(form.password)) {
      e.password = 'Debe incluir al menos una letra mayúscula';
    } else if (!/[a-z]/.test(form.password)) {
      e.password = 'Debe incluir al menos una letra minúscula';
    } else if (!/[0-9]/.test(form.password)) {
      e.password = 'Debe incluir al menos un número';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      e.password = 'Debe incluir al menos un carácter especial (!@#$%^&*)';
    }

    if (form.password !== confirmPassword) {
      e.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    setErrors({});
    try {
      const data = {
        ...form,
        nombre: form.nombre.trim(),
        apellidoPaterno: form.apellidoPaterno.trim(),
        apellidoMaterno: form.apellidoMaterno ? form.apellidoMaterno.trim() : '',
      };
      const res = await register(data);
      if (res?.requiresVerification || res?.token === 'pending_verification') {
        window.location.replace(`${ROUTES.CONFIRMAR_CORREO}?correo=${encodeURIComponent(data.correo)}`);
      } else {
        window.location.replace(ROUTES.DASHBOARD);
      }
    } catch (err: unknown) {
      setLoading(false);
      const status = getErrorStatus(err);
      const rawMsg = getErrorMessage(err, '');
      
      if (status === 409 || rawMsg.toLowerCase().includes('registrado') || rawMsg.toLowerCase().includes('duplicado') || rawMsg.toLowerCase().includes('already exists')) {
        setErrors({ correo: 'Este correo ya está registrado. ¿Ya tienes cuenta?' });
      } else if (!status && (rawMsg.includes('Network Error') || rawMsg.includes('Error de conexión'))) {
        setApiError('No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet o intenta de nuevo.');
      } else {
        setApiError(rawMsg || 'Ocurrió un error al registrar la cuenta. Por favor, intenta de nuevo.');
      }
    }
  };

  return (
    <AuthLayout title="Crear Cuenta" subtitle="Únete a la plataforma de bioseguridad más avanzada">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {apiError && <div className={styles.errorBox}>{apiError}</div>}

        <Input
          label="Nombre(s)"
          placeholder="Tu nombre"
          icon={<User size={18} />}
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          error={errors.nombre}
          autoComplete="given-name"
          maxLength={100}
        />

        <Input
          label="Apellido Paterno"
          placeholder="Primer apellido"
          icon={<User size={18} />}
          value={form.apellidoPaterno}
          onChange={(e) => setForm({ ...form, apellidoPaterno: e.target.value })}
          error={errors.apellidoPaterno}
          autoComplete="family-name"
          maxLength={100}
        />

        <Input
          label="Apellido Materno (Opcional)"
          placeholder="Segundo apellido"
          icon={<User size={18} />}
          value={form.apellidoMaterno}
          onChange={(e) => setForm({ ...form, apellidoMaterno: e.target.value })}
          error={errors.apellidoMaterno}
          autoComplete="additional-name"
          maxLength={100}
        />

        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          icon={<Mail size={18} />}
          value={form.correo}
          onChange={(e) => setForm({ ...form, correo: e.target.value })}
          error={errors.correo}
          autoComplete="email"
        />

        <Input
          label="Contraseña"
          type="password"
          placeholder="8-16 caracteres (mayúscula, minúscula, número y símbolo)"
          icon={<Lock size={18} />}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          autoComplete="new-password"
          maxLength={16}
        />

        <Input
          label="Confirmar Contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          icon={<Lock size={18} />}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
          maxLength={16}
        />

        <div className={styles.actions}>
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Registrarse
          </Button>
        </div>

        <div className={styles.registerLink}>
          ¿Ya tienes cuenta? <Link to={ROUTES.LOGIN}>Inicia sesión</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
