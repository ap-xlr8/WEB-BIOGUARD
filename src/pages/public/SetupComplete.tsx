import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, LoadingSpinner } from '../../components/ui';
import { pacienteService, usuarioService } from '../../services';
import { useAuth } from '../../context';
import { ROUTES } from '../../constants';

const QR_LOGIN_URL = 'bioguard://login?code=';

export default function SetupCompletePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState(user?.nombre || 'Usuario');
  const [patientName, setPatientName] = useState('');
  const [accessCode, setAccessCode] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    let active = true;
    Promise.allSettled([usuarioService.miPerfil(), pacienteService.miPaciente()])
      .then(async ([profileResult, patientResult]) => {
        if (!active) return;
        if (profileResult.status === 'fulfilled') setDisplayName(profileResult.value.nombre);
        if (patientResult.status === 'fulfilled') {
          setPatientName(patientResult.value.nombre);
          const qr = await pacienteService.obtenerQR(patientResult.value.id);
          if (active) setAccessCode(qr.codigoAccesoQr || '');
        }
      })
      .catch(() => null)
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [isAuthenticated, navigate]);

  if (loading) return <LoadingSpinner />;

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--color-bg-secondary)', padding: 24 }}>
      <section style={{ maxWidth: 520, width: '100%', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 36, textAlign: 'center', boxShadow: 'var(--shadow-lg)' }} aria-labelledby="setup-title">
        <div style={{ width: 54, height: 54, borderRadius: 8, background: 'var(--color-emerald-glow)', color: 'var(--color-emerald)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
          <Check size={26} aria-hidden="true" />
        </div>
        <h1 id="setup-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', marginBottom: 8 }}>Configuración completada</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 26 }}>
          Hola, <strong>{displayName}</strong>. La vinculación del paciente se realiza con el código emitido por el backend.
        </p>

        {accessCode ? (
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 24, maxWidth: 290, margin: '0 auto 26px' }}>
            <QRCodeSVG value={`${QR_LOGIN_URL}${accessCode}`} size={174} level="H" title={`QR de acceso de ${patientName}`} />
            <span style={{ display: 'block', marginTop: 14, color: 'var(--color-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700 }}>Código de acceso</span>
            <strong style={{ display: 'block', marginTop: 4, color: 'var(--color-blue)', overflowWrap: 'anywhere' }}>{accessCode}</strong>
          </div>
        ) : (
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 20, marginBottom: 26, color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
            Aún no existe un paciente con código de acceso. Créalo desde el panel para generar un QR real.
          </div>
        )}

        <Button fullWidth size="lg" onClick={() => navigate(ROUTES.DASHBOARD)}>
          Ir al panel <ArrowRight size={16} aria-hidden="true" style={{ marginLeft: 6 }} />
        </Button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 20, color: 'var(--color-text-muted)', fontSize: '0.76rem' }}>
          <ShieldCheck size={14} aria-hidden="true" /> No se generan códigos aleatorios en el navegador
        </div>
      </section>
    </main>
  );
}
