import { BookOpen, Bluetooth, HeartPulse, WifiOff } from 'lucide-react';
import { PublicLayout } from '../../components/layout';
import styles from './Public.module.css';

const resources = [
  {
    icon: WifiOff,
    title: 'Qué ocurre cuando el móvil pierde Internet',
    summary: 'La captura y el transporte local no deberían detenerse por una interrupción de red.',
    body: 'El wearable continúa registrando señales y el móvil conserva en Room las lecturas recibidas. Al recuperar conectividad, la sincronización procesa únicamente los registros pendientes de confirmación.',
  },
  {
    icon: Bluetooth,
    title: 'Diferencia entre Bluetooth e Internet',
    summary: 'Son dos tramos independientes dentro de la arquitectura de BioGuard.',
    body: 'El reloj se comunica con el teléfono a través del canal de Wear OS sobre Bluetooth. La conexión a Internet se utiliza después, cuando el teléfono sincroniza el histórico con el backend.',
  },
  {
    icon: HeartPulse,
    title: 'Cómo interpretar una señal no disponible',
    summary: 'La ausencia de una métrica no equivale a un valor clínico de cero.',
    body: 'Algunos sensores dependen del modelo, permisos o APIs del fabricante. La interfaz debe indicar que la señal no está disponible y continuar mostrando las métricas que sí fueron capturadas.',
  },
];

export default function BlogPage() {
  return (
    <PublicLayout>
      <div className={styles.content}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}><BookOpen size={28} /></div>
          <h1>Recursos</h1>
          <p>Notas breves sobre conectividad, sincronización y lectura responsable de la información.</p>
        </div>

        <div className={styles.resourceList}>
          {resources.map((resource) => (
            <details className={styles.resourceItem} key={resource.title}>
              <summary>
                <resource.icon size={21} aria-hidden="true" />
                <span><strong>{resource.title}</strong><small>{resource.summary}</small></span>
              </summary>
              <p>{resource.body}</p>
            </details>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
