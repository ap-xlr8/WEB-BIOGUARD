import { Scale } from 'lucide-react';
import { PublicLayout } from '../../components/layout';
import styles from './Public.module.css';

export default function AvisoLegalPage() {
  return (
    <PublicLayout>
      <div className={styles.content}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}><Scale size={28} /></div>
          <h1>Aviso Legal</h1>
          <p>Condiciones generales de información y alcance del proyecto BioGuard.</p>
        </div>
        <article className={styles.legalText}>
          <h2>Naturaleza del servicio</h2>
          <p>BioGuard es una plataforma tecnológica de apoyo preventivo. No es un dispositivo médico certificado, no emite diagnósticos y no reemplaza la consulta, tratamiento o indicaciones de profesionales de la salud.</p>
          <h2>Disponibilidad de señales</h2>
          <p>Las métricas disponibles dependen del wearable, del sistema operativo, de los permisos concedidos y de las APIs públicas del fabricante. La ausencia de una señal debe mostrarse como dato no disponible.</p>
          <h2>Emergencias</h2>
          <p>Ante síntomas o una posible emergencia, el usuario debe contactar a los servicios locales de emergencia. Las alertas de BioGuard son complementarias y pueden verse afectadas por batería, conectividad o configuración del dispositivo.</p>
        </article>
      </div>
    </PublicLayout>
  );
}
