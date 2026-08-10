import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, Mail, MessageSquare } from 'lucide-react';
import { Button, Input, toast } from '../../components/ui';
import { PublicLayout } from '../../components/layout';
import { useAuth } from '../../context';
import { ROUTES } from '../../constants';
import httpClient from '../../utils/httpClient';
import styles from './Public.module.css';

export default function ContactoPage() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ asunto: '', mensaje: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.asunto.trim() || !form.mensaje.trim()) {
      toast.error('Asunto y mensaje son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await httpClient.post('/api/Tickets', {
        asunto: form.asunto.trim(),
        descripcion: form.mensaje.trim(),
        categoria: 'soporte_general',
        prioridad: 'normal',
      });
      toast.success('Ticket de soporte registrado correctamente.');
      setForm({ asunto: '', mensaje: '' });
    } catch {
      toast.error('No fue posible registrar el ticket. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className={styles.content}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}><Mail size={28} /></div>
          <h1>Contacto y soporte</h1>
          <p>Los casos de soporte se registran en el backend para conservar su seguimiento y trazabilidad.</p>
        </div>

        {isAuthenticated ? (
          <div className={styles.formCard}>
            <form onSubmit={handleSubmit}>
              <Input
                label="Asunto"
                maxLength={160}
                required
                value={form.asunto}
                onChange={(event) => setForm({ ...form, asunto: event.target.value })}
              />
              <div className={styles.formGroup}>
                <label htmlFor="contact-message">Mensaje</label>
                <textarea
                  id="contact-message"
                  className={styles.textarea}
                  maxLength={4_000}
                  required
                  value={form.mensaje}
                  onChange={(event) => setForm({ ...form, mensaje: event.target.value })}
                />
              </div>
              <Button fullWidth size="lg" loading={loading}>
                <MessageSquare size={16} aria-hidden="true" style={{ marginRight: 8 }} /> Crear ticket
              </Button>
            </form>
          </div>
        ) : (
          <div className={styles.formCard} style={{ textAlign: 'center' }}>
            <LogIn size={28} aria-hidden="true" style={{ color: 'var(--color-blue)', marginBottom: 12 }} />
            <h2 style={{ fontSize: '1.1rem', marginBottom: 8 }}>Inicia sesión para contactar soporte</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
              Así podemos asociar el caso a tu cuenta, proteger la información y mostrar su estado en el Centro de Soporte.
            </p>
            <Link to={ROUTES.LOGIN} className={styles.primaryLink}>Iniciar sesión</Link>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
