import { Activity, Bluetooth, Cloud, Database, ShieldCheck, WifiOff } from 'lucide-react';
import { PublicLayout } from '../../components/layout';
import styles from './Public.module.css';

const capabilities = [
  { icon: Bluetooth, title: 'Transporte local', text: 'El wearable entrega su telemetría al teléfono vinculado mediante el canal de Wear OS sobre Bluetooth.' },
  { icon: Database, title: 'Persistencia offline', text: 'El móvil conserva las lecturas en Room y distingue qué registros siguen pendientes de sincronización.' },
  { icon: Cloud, title: 'Sincronización controlada', text: 'Con Internet disponible, el móvil agrupa y envía únicamente los datos que la nube aún no confirmó.' },
  { icon: Activity, title: 'Histórico web', text: 'La Web consulta estadísticas, tendencias, eventos y reportes desde los endpoints autorizados del backend.' },
  { icon: ShieldCheck, title: 'Acceso protegido', text: 'Las rutas privadas requieren sesión y el backend vuelve a validar rol y propiedad para cada recurso.' },
  { icon: WifiOff, title: 'Continuidad sin red', text: 'La pérdida de Internet no debe interrumpir la captura local ni la comunicación entre reloj y teléfono.' },
];

export default function CaracteristicasPage() {
  return (
    <PublicLayout>
      <div className={styles.content}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}><Bluetooth size={28} /></div>
          <h1>Cómo funciona BioGuard</h1>
          <p>Una arquitectura offline-first que separa captura, transporte local, persistencia y consulta histórica.</p>
        </div>
        <div className={styles.featureGrid}>
          {capabilities.map((item) => (
            <article className={styles.featureCard} key={item.title}>
              <item.icon size={22} aria-hidden="true" />
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <div className={styles.legalText}>
          <h2>Alcance clínico</h2>
          <p>
            La disponibilidad de cada señal depende del hardware, permisos y APIs ofrecidas por el fabricante. Un valor ausente no se sustituye por cero ni por datos simulados. BioGuard no realiza una medición directa de glucosa y no debe utilizarse para tomar decisiones médicas sin supervisión profesional.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
