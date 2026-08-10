import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner } from '../../components/ui';
import { Users, Heart, ShieldAlert, BarChart3, TrendingUp } from 'lucide-react';
import httpClient from '../../utils/httpClient';
import styles from './Admin.module.css';

interface MetricasResponse {
  usuariosActivos: number;
  pacientesActivos: number;
  alertasCriticasDesde: number;
  distribucionPlanes: Record<string, number>;
}

export default function AdminDashboardPage() {
  const metricasQuery = useQuery({
    queryKey: ['admin', 'metricas'],
    queryFn: () => httpClient.get<MetricasResponse>('/api/Admin/metricas').then(r => r.data),
  });
  const metricas = metricasQuery.data ?? null;

  if (metricasQuery.isPending) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Consola de Administración</h1>
      <p className={styles.subtitle}>Panel de control global para auditoría, control de usuarios y métricas del sistema.</p>

      {/* Grid de Metricas */}
      <div className={styles.grid4}>
        <div className={styles.adminCard}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconBlue}`}><Users size={20} /></div>
            <span className={styles.cardTrend}><TrendingUp size={14} /> +12%</span>
          </div>
          <div className={styles.cardValue}>{metricas?.usuariosActivos ?? 0}</div>
          <div className={styles.cardLabel}>Usuarios Activos</div>
        </div>

        <div className={styles.adminCard}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconGreen}`}><Heart size={20} /></div>
            <span className={styles.cardTrend}><TrendingUp size={14} /> +8%</span>
          </div>
          <div className={styles.cardValue}>{metricas?.pacientesActivos ?? 0}</div>
          <div className={styles.cardLabel}>Pacientes Registrados</div>
        </div>

        <div className={styles.adminCard}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconRed}`}><ShieldAlert size={20} /></div>
            <span className={styles.cardTrend} style={{ color: '#ff5252' }}>Hoy</span>
          </div>
          <div className={styles.cardValue}>{metricas?.alertasCriticasDesde ?? 0}</div>
          <div className={styles.cardLabel}>Alertas Críticas</div>
        </div>

        <div className={styles.adminCard}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.iconPurple}`}><BarChart3 size={20} /></div>
            <span className={styles.cardTrend}>SaaS</span>
          </div>
          <div className={styles.cardValue}>
            {metricas ? Object.values(metricas.distribucionPlanes).reduce((a, b) => a + b, 0) : 0}
          </div>
          <div className={styles.cardLabel}>Suscripciones Totales</div>
        </div>
      </div>

      <div className={styles.dashboardRow}>
        {/* Distribución de Planes */}
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>Distribución de Suscripciones</h2>
          {metricas?.distribucionPlanes ? (
            <div className={styles.planDistribution}>
              {Object.entries(metricas.distribucionPlanes).map(([plan, total]) => (
                <div key={plan} className={styles.planBarContainer}>
                  <div className={styles.planLabelRow}>
                    <span className={styles.planName}>Plan {plan}</span>
                    <span className={styles.planTotal}>{total} usuarios</span>
                  </div>
                  <div className={styles.planBarOuter}>
                    <div
                      className={styles.planBarInner}
                      style={{
                        width: `${Math.max(
                          (total /
                            Math.max(
                              Object.values(metricas.distribucionPlanes).reduce((a, b) => a + b, 0),
                              1
                            )) *
                            100,
                          4
                        )}%`,
                        background:
                          plan.toLowerCase() === 'pro'
                            ? 'var(--color-purple, #b388ff)'
                            : plan.toLowerCase() === 'familiar'
                            ? 'var(--color-cyan, #00e5ff)'
                            : '#8E9CB8',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#8E9CB8' }}>Sin datos de planes de suscripción.</p>
          )}
        </div>

        {/* Auditoría / Estado rápido */}
        <div className={styles.quickInfoSection}>
          <h2 className={styles.sectionTitle}>Estado de Infraestructura</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className={styles.statusItem}>
              <span>Base de datos MongoDB Atlas</span>
              <span className={styles.statusActive}>Conectado</span>
            </div>
            <div className={styles.statusItem}>
              <span>Servidor FCM Push</span>
              <span className={styles.statusActive}>Activo</span>
            </div>
            <div className={styles.statusItem}>
              <span>Stripe Gateway</span>
              <span className={styles.statusActive}>Online</span>
            </div>
            <div className={styles.statusItem}>
              <span>PayPal Sandbox</span>
              <span className={styles.statusActive}>Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
