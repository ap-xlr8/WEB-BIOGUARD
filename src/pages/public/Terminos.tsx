import { PublicLayout } from '../../components/layout';
import { ShieldAlert } from 'lucide-react';
import styles from './Public.module.css';

export default function TerminosPage() {
  return (
    <PublicLayout>
      <div className={styles.content}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}><ShieldAlert size={28} /></div>
          <h1>Términos de Servicio</h1>
          <p>Última actualización: 4 de Agosto, 2026</p>
        </div>

        <div className={styles.legalText}>
          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al registrarte y hacer uso del software y ecosistema de BioGuard (plataforma web, app móvil y Wear OS), declaras conocer y aceptar la totalidad de las presentes cláusulas de uso del servicio.
          </p>

          <h2>2. Aviso de Alcance Médico Obligatorio</h2>
          <p>
            <strong>IMPORTANTE:</strong> BioGuard es una herramienta preventiva y académica de estimación indirecta de riesgo metabólico a partir de sensores wearables de consumo. <strong>BioGuard no sustituye a un glucómetro tradicional, a un monitor continuo de glucosa (CGM) ni al diagnóstico de un médico o profesional de la salud calificado.</strong>
          </p>
          <p>
            El usuario acepta que el sistema no realiza mediciones de laboratorio sobre sangre ni indica dosis de insulina u otros tratamientos. Cualquier decisión terapéutica debe basarse únicamente en dispositivos clínicos acreditados.
          </p>

          <h2>3. Responsabilidad sobre Alertas y Escalamiento</h2>
          <p>
            El modo Guardián Nocturno depende de la conectividad a Internet del móvil del paciente, del estado de la batería del reloj y de la correcta recepción de notificaciones push de Firebase (FCM). BioGuard no se hace responsable por fallas en la red telefónica, interrupciones de WiFi o suspensiones de energía que impidan el correcto escalamiento de las alarmas críticas a los cuidadores.
          </p>

          <h2>4. Uso Académico</h2>
          <p>
            BioGuard es un prototipo desarrollado con fines académicos. No cuenta con certificación de agencias reguladoras de dispositivos médicos o de salud pública en esta fase de desarrollo.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
