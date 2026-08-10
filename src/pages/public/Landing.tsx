import { Link } from 'react-router-dom';
import { Activity, Bluetooth, CloudUpload, Database, HeartPulse, ShieldCheck } from 'lucide-react';
import { PublicLayout } from '../../components/layout';
import { ROUTES } from '../../constants';
import styles from './Landing.module.css';

const workflow = [
  {
    icon: Activity,
    title: 'El wearable registra',
    text: 'Captura únicamente las señales disponibles y conserva las lecturas pendientes en el reloj.',
  },
  {
    icon: Bluetooth,
    title: 'El móvil recibe por Bluetooth',
    text: 'La aplicación móvil almacena los datos en Room y sigue operando aunque no exista conexión a Internet.',
  },
  {
    icon: CloudUpload,
    title: 'La nube sincroniza pendientes',
    text: 'Cuando vuelve la conectividad, el móvil envía solo los registros que todavía no han sido confirmados.',
  },
];

export default function LandingPage() {
  return (
    <PublicLayout>
      <div className={styles.landing}>
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Monitoreo preventivo conectado</span>
            <h1 id="landing-title">BioGuard</h1>
            <p className={styles.lead}>
              Un ecosistema Wear OS, móvil y web para registrar señales fisiológicas,
              conservarlas sin conexión y consultar su historial desde una cuenta protegida.
            </p>
            <div className={styles.actions}>
              <Link to={ROUTES.REGISTRO} className={styles.primaryAction}>Crear cuenta</Link>
              <Link to={ROUTES.CARACTERISTICAS} className={styles.secondaryAction}>Conocer el flujo</Link>
            </div>
            <p className={styles.clinicalNotice}>
              BioGuard es una herramienta de apoyo preventivo. No diagnostica ni sustituye la evaluación de un profesional de la salud.
            </p>
          </div>

          <div className={styles.productPanel} aria-label="Vista previa del panel sin datos clínicos">
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.panelKicker}>Panel de salud</span>
                <strong>Última información sincronizada</strong>
              </div>
              <span className={styles.pendingBadge}>Sin paciente</span>
            </div>
            <div className={styles.metricGrid}>
              <div className={styles.metric}>
                <HeartPulse size={20} aria-hidden="true" />
                <span>Frecuencia cardiaca</span>
                <strong>-- <small>BPM</small></strong>
              </div>
              <div className={styles.metric}>
                <Activity size={20} aria-hidden="true" />
                <span>Lecturas disponibles</span>
                <strong>--</strong>
              </div>
            </div>
            <div className={styles.chartEmpty}>
              <div className={styles.chartLine} />
              <span>La gráfica aparecerá cuando el backend reciba lecturas reales.</span>
            </div>
            <div className={styles.sourceRow}>
              <Database size={16} aria-hidden="true" />
              <span>Fuente: histórico sincronizado del backend</span>
            </div>
          </div>
        </section>

        <section className={styles.workflowSection} id="como-funciona" aria-labelledby="workflow-title">
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>Arquitectura offline-first</span>
            <h2 id="workflow-title">Los datos siguen un recorrido verificable</h2>
            <p>El reloj se comunica con el móvil; el móvil decide cuándo sincronizar con el backend.</p>
          </div>
          <div className={styles.workflowGrid}>
            {workflow.map((step, index) => (
              <article className={styles.workflowItem} key={step.title}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <step.icon size={22} aria-hidden="true" />
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.assuranceBand} aria-labelledby="assurance-title">
          <div>
            <span className={styles.eyebrow}>Privacidad y control</span>
            <h2 id="assurance-title">Diseñado para datos sensibles</h2>
          </div>
          <div className={styles.assuranceList}>
            <span><ShieldCheck size={19} aria-hidden="true" /> Sesiones con expiración y renovación segura</span>
            <span><ShieldCheck size={19} aria-hidden="true" /> Acceso validado por rol y propiedad en el backend</span>
            <span><ShieldCheck size={19} aria-hidden="true" /> Sin telemetría clínica ficticia en la interfaz</span>
          </div>
        </section>

        <section className={styles.ctaBand} aria-labelledby="cta-title">
          <div>
            <h2 id="cta-title">Consulta los planes vigentes</h2>
            <p>Precios, límites y funciones se obtienen directamente del servicio de planes.</p>
          </div>
          <Link to={ROUTES.LICENCIAMIENTOS} className={styles.primaryAction}>Ver planes</Link>
        </section>
      </div>
    </PublicLayout>
  );
}
