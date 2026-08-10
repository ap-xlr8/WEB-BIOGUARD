import { PublicLayout } from '../../components/layout';
import { Lock } from 'lucide-react';
import styles from './Public.module.css';

export default function PrivacidadPage() {
  return (
    <PublicLayout>
      <div className={styles.content}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}><Lock size={28} /></div>
          <h1>Política de Privacidad</h1>
          <p>Última actualización: 4 de Agosto, 2026</p>
        </div>

        <div className={styles.legalText}>
          <h2>1. Tratamiento de Datos de Salud y Telemetría</h2>
          <p>
            BioGuard recopila biomarcadores fisiológicos capturados a través del reloj (ritmo cardíaco, temperatura y sudoración) y los almacena directamente en MongoDB Atlas. Estos datos se utilizan exclusivamente con el fin de calcular tu indicador IRME y mostrar reportes históricos detallados en la plataforma web y la app móvil.
          </p>

          <h2>2. Protección de Ubicación GPS</h2>
          <p>
            De acuerdo con nuestros estándares de seguridad, <strong>las coordenadas geográficas recopiladas mediante GPS se almacenan en nuestra base de datos en formato estrictamente cifrado</strong>. Ubicación en claro permanece vacío y solo se desencripta localmente en dispositivos móviles autorizados en situaciones de emergencia declarada (cuando falla la respuesta del paciente).
          </p>

          <h2>3. Compartición con Cuidadores</h2>
          <p>
            Al otorgar permisos a un Cuidador y compartir tu código QR o de acceso alfanumérico, estás autorizando de forma voluntaria que dicha cuenta acceda a tu telemetría metabólica, alertas y reportes históricos de tomas de medicamentos según el nivel de rol asignado. Puedes revocar este acceso en cualquier momento desde tu panel de Ajustes.
          </p>

          <h2>4. Pasarelas de Pago de Terceros</h2>
          <p>
            Los pagos se procesan en su totalidad mediante Stripe o PayPal. BioGuard no recopila, almacena ni manipula datos de tarjetas de crédito o credenciales de pago. Solo guardamos la confirmación del pago (SessionId, MetodoPago y Monto) enviada de manera segura vía webhook por el proveedor.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
