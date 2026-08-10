import { PublicLayout } from '../../components/layout';
import { Users, GraduationCap, Award } from 'lucide-react';
import styles from './Public.module.css';

export default function NosotrosPage() {
  return (
    <PublicLayout>
      <div className={styles.content}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}><Users size={28} /></div>
          <h1>Sobre Nosotros</h1>
          <p>
            Conoce al equipo de desarrollo y el trasfondo académico detrás de la plataforma de monitoreo BioGuard.
          </p>
        </div>

        <div className={styles.legalText} style={{ marginBottom: 40 }}>
          <h2>Misión del Proyecto</h2>
          <p>
            BioGuard nació como una propuesta académica enfocada en resolver una necesidad crítica: el monitoreo de pacientes metabólicos (por ejemplo, personas con diabetes) de forma no invasiva mediante el aprovechamiento de sensores inteligentes ya disponibles en dispositivos de consumo diario, como los wearables con Wear OS.
          </p>
          <p>
            Nuestro propósito es proporcionar tranquilidad a las familias a través de herramientas automatizadas que detecten anomalías fisiológicas y alerten preventivamente a los contactos designados sin interferir con las actividades diarias del paciente.
          </p>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Equipo Académico</h2>

        <div className={styles.teamGrid}>
          <div className={styles.teamCard}>
            <div className={styles.teamAvatar}>AM</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 4 }}>Alexi Martinez</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>Líder de Proyecto y Arquitecto</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, color: 'var(--color-cyan)', fontSize: '0.8rem', fontWeight: 600 }}>
              <GraduationCap size={16} /> Ingeniería en Sistemas
            </div>
          </div>
          <div className={styles.teamCard}>
            <div className={styles.teamAvatar}>BG</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 4 }}>Colaboradores BioGuard</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>Desarrollo Multiplataforma e IoT</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, color: 'var(--color-cyan)', fontSize: '0.8rem', fontWeight: 600 }}>
              <Award size={16} /> Presentación Académica Consolidada
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
