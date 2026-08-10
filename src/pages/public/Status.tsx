import { useCallback, useEffect, useState } from 'react';
import { Activity, RefreshCw, Server, ShieldCheck } from 'lucide-react';
import { PublicLayout } from '../../components/layout';
import { Button } from '../../components/ui';
import httpClient from '../../utils/httpClient';
import styles from './Public.module.css';

type ServiceState = 'checking' | 'online' | 'unavailable';

export default function StatusPage() {
  const [backendState, setBackendState] = useState<ServiceState>('checking');
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setBackendState('checking');
    try {
      await httpClient.get('/health', { timeout: 5_000 });
      setBackendState('online');
    } catch {
      setBackendState('unavailable');
    } finally {
      setCheckedAt(new Date());
    }
  }, []);

  useEffect(() => { void checkHealth(); }, [checkHealth]);

  const label = backendState === 'checking' ? 'Verificando' : backendState === 'online' ? 'Operativo' : 'No verificable';

  return (
    <PublicLayout>
      <div className={styles.content}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}><ShieldCheck size={28} /></div>
          <h1>Estado del servicio</h1>
          <p>Esta página consulta el endpoint de salud en tiempo real. No muestra métricas estimadas.</p>
        </div>

        <div className={styles.statusGrid} aria-live="polite">
          <div className={styles.statusCard}>
            <div className={styles.statusLeft}>
              <Activity size={20} style={{ color: 'var(--color-emerald)' }} aria-hidden="true" />
              <div>
                <div className={styles.statusLabel}>Aplicación Web</div>
                <div className={styles.statusDesc}>La interfaz se cargó correctamente en este dispositivo.</div>
              </div>
            </div>
            <span className={`${styles.statusBadge} ${styles.statusOk}`}>Operativa</span>
          </div>

          <div className={styles.statusCard}>
            <div className={styles.statusLeft}>
              <Server size={20} style={{ color: backendState === 'online' ? 'var(--color-emerald)' : 'var(--color-warning)' }} aria-hidden="true" />
              <div>
                <div className={styles.statusLabel}>BioGuard API</div>
                <div className={styles.statusDesc}>
                  {checkedAt ? `Última comprobación: ${checkedAt.toLocaleTimeString('es-MX')}` : 'Comprobación en curso'}
                </div>
              </div>
            </div>
            <span className={`${styles.statusBadge} ${backendState === 'online' ? styles.statusOk : ''}`}>{label}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <Button variant="secondary" onClick={() => void checkHealth()} loading={backendState === 'checking'}>
            <RefreshCw size={16} aria-hidden="true" style={{ marginRight: 8 }} /> Actualizar estado
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
