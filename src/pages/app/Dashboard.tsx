import { useState, useMemo } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, Thermometer, Droplets, Brain, UserPlus, Activity, BarChart3, Shield, CheckCircle, Clock, Calendar, Users, QrCode, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LoadingSpinner, Button, toast } from '../../components/ui';
import { PacienteModal } from '../../components/ui/PacienteModal';
import { sensorService, pacienteService, medicamentoService, cuidadorService } from '../../services';
import { useAuth } from '../../context';
import { EstadisticasResponse, TendenciaItem, PacienteResponse, MedicamentoResponse, TrackingResponse } from '../../types';
import styles from './Dashboard.module.css';
import { APP_PERMISSIONS, hasPermission } from '../../auth/authorization';

interface MedicamentoItem {
  id: string;
  nombre: string;
  dosis: string;
  hora: string;
  tomado: boolean;
}

interface CuidadorItem {
  nombre: string;
  rol: string;
}

export default function DashboardPage() {
  const { user, access } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const canCreatePatient = hasPermission(access, APP_PERMISSIONS.PATIENT_CREATE);
  const canReadPatient = hasPermission(access, APP_PERMISSIONS.PATIENT_READ);
  const canReadSummary = hasPermission(access, APP_PERMISSIONS.HEALTH_SUMMARY);
  const canReadHistory = hasPermission(access, APP_PERMISSIONS.HEALTH_HISTORY);
  const canReadMedication = hasPermission(access, APP_PERMISSIONS.MEDICATION_READ);
  const canTakeMedication = hasPermission(access, APP_PERMISSIONS.MEDICATION_TAKE);
  const canManageCaregivers = hasPermission(access, APP_PERMISSIONS.CAREGIVER_MANAGE);
  const canReadGps = hasPermission(access, APP_PERMISSIONS.GPS_CONTINUOUS);

  const pacienteQuery = useQuery({
    queryKey: ['paciente'],
    queryFn: async () => {
      try {
        return access?.pacienteId
          ? await pacienteService.getById(access.pacienteId)
          : await pacienteService.miPaciente();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: canReadPatient || canCreatePatient,
  });
  const paciente: PacienteResponse | null = pacienteQuery.data ?? null;
  const pacienteId = paciente?.id;

  const statsQuery = useQuery({
    queryKey: ['estadisticas', pacienteId],
    queryFn: () => sensorService.getEstadisticas(pacienteId!),
    enabled: !!pacienteId && canReadSummary,
  });
  const tendenciasQuery = useQuery({
    queryKey: ['tendencia', pacienteId, 'diario'],
    queryFn: () => sensorService.getTendencia(pacienteId!, 'diario'),
    enabled: !!pacienteId && canReadHistory,
  });
  const medicamentosQuery = useQuery({
    queryKey: ['medicamentos', pacienteId],
    queryFn: () => medicamentoService.getByPaciente(pacienteId!),
    enabled: !!pacienteId && canReadMedication,
  });
  const cuidadoresQuery = useQuery({
    queryKey: ['cuidadores', pacienteId],
    queryFn: () => cuidadorService.getByPaciente(pacienteId!),
    enabled: !!pacienteId && canManageCaregivers,
  });
  const trackingQuery = useQuery({
    queryKey: ['tracking', pacienteId, 'actual'],
    queryFn: () => sensorService.getTrackingActual(pacienteId!),
    enabled: !!pacienteId && canReadGps,
    retry: false,
  });

  const stats: EstadisticasResponse | null = statsQuery.data ?? null;
  const tendencias: TendenciaItem[] = tendenciasQuery.data ?? [];
  const medicamentos: MedicamentoItem[] = useMemo(
    () => (medicamentosQuery.data ?? []).map(m => ({
      id: m.id,
      nombre: m.nombre,
      dosis: m.dosis,
      hora: m.horario,
      tomado: !!m.ultimaToma,
    })),
    [medicamentosQuery.data]
  );
  const cuidadores: CuidadorItem[] = useMemo(
    () => (cuidadoresQuery.data ?? []).map(c => ({
      nombre: c.nombre,
      rol: c.parentesco || 'Cuidador',
    })),
    [cuidadoresQuery.data]
  );
  const tracking: TrackingResponse | null = trackingQuery.data ?? null;

  const toggleMedMutation = useMutation({
    mutationFn: (id: string) => medicamentoService.registrarToma(id),
    onMutate: (id) => {
      const prev = queryClient.getQueryData<MedicamentoResponse[]>(['medicamentos', pacienteId]);
      queryClient.setQueryData<MedicamentoResponse[]>(['medicamentos', pacienteId], (old) =>
        old?.map(m => (m.id === id ? { ...m, ultimaToma: new Date().toISOString() } : m)) ?? old
      );
      return { prev };
    },
    onError: (_err, id, context) => {
      if (context?.prev) queryClient.setQueryData(['medicamentos', pacienteId], context.prev);
      const target = medicamentos.find(m => m.id === id);
      toast.error(`Error al registrar la toma de ${target?.nombre || 'medicamento'}.`);
    },
    onSuccess: (_, id) => {
      const target = medicamentos.find(m => m.id === id);
      toast.success(`Dosis de ${target?.nombre || 'medicamento'} registrada correctamente.`);
    },
  });

  const handleToggleMed = (id: string) => {
    if (canTakeMedication) toggleMedMutation.mutate(id);
  };

  const retry = () => queryClient.invalidateQueries();

  if (pacienteQuery.isLoading) return <LoadingSpinner />;

  if (pacienteQuery.isError) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', background: 'var(--color-danger-bg)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: 12, color: 'var(--color-danger)', maxWidth: 500, margin: '40px auto' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>Error al cargar el panel</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>No fue posible consultar los datos autorizados. Verifica tu conexión e intenta de nuevo.</p>
        <Button onClick={retry}>Reintentar</Button>
      </div>
    );
  }

  const tieneDatos = stats && typeof stats.ultimoPulso === 'number';
  const riesgoIA = !stats || !tieneDatos
    ? null
    : stats.estadoActual === 'Critico' ? 'Crítico' : stats.estadoActual === 'Pre-Pico' ? 'Pre-Pico' : 'Normal';
  const riesgoAccent = !riesgoIA ? 'green' : riesgoIA === 'Crítico' ? 'yellow' : riesgoIA === 'Pre-Pico' ? 'yellow' : 'green';

  const isCaregiver = canReadSummary && access?.rol !== 'paciente';
  const isPatient = canReadSummary && access?.rol === 'paciente';

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 className={styles.title}>Panel de monitoreo</h1>
          <p className={styles.subtitle}>
            {paciente
              ? <>Monitoreo de <span style={{ color: 'var(--color-blue)', fontWeight: 600 }}>{paciente.nombre}</span> · Plan {user?.plan || 'Gratis'}</>
              : <>Bienvenido, <span style={{ color: 'var(--color-blue)', fontWeight: 600 }}>{user?.nombre || 'Usuario'}</span> · Plan {user?.plan || 'Gratis'}</>
            }
          </p>
        </div>
        {!paciente && canCreatePatient && <div className={styles.topBar}>
          <Button onClick={() => setModalOpen(true)}>
            <UserPlus size={15} style={{ marginRight: 6 }} />
            Crear paciente
          </Button>
        </div>}
      </div>

      {!canReadSummary && (
        <div className={styles.emptyState} style={{ padding: 40, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <div className={styles.emptyIcon}><Shield size={22} style={{ color: 'var(--color-blue)' }} /></div>
          <div className={styles.emptyTitle}>Acceso limitado a alertas</div>
          <div className={styles.emptyText}>Tu autorización actual no incluye el resumen ni el historial biomédico.</div>
        </div>
      )}

      {paciente && stats && tieneDatos && (
        <div className={styles.summaryBar}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryDot} />
            <span className={styles.summaryText}>Estado del Sistema</span>
            <span className={styles.summaryValue} style={{ color: stats.estadoActual === 'Critico' ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {stats.estadoActual === 'Critico' ? 'Alerta Crítica' : 'Estable'}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <Activity size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <span className={styles.summaryText}>Lecturas analizadas</span>
            <span className={styles.summaryValue}>{stats.totalLecturas}</span>
          </div>
          <div className={styles.summaryItem}>
            <BarChart3 size={14} style={{ color: 'var(--color-text-secondary)' }} />
            <span className={styles.summaryText}>Promedio pulso</span>
            <span className={styles.summaryValue}>{stats.promedioPulso ? Math.round(stats.promedioPulso) : '--'} BPM</span>
          </div>
        </div>
      )}

      {/* RENDER CUIDADOR HUB */}
      {isCaregiver && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {!paciente ? (
            <div className={styles.emptyState} style={{ padding: 40, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
              <div className={styles.emptyIcon}><Users size={22} style={{ color: 'var(--color-blue)' }} /></div>
              <div className={styles.emptyTitle}>No tienes pacientes vinculados</div>
              <div className={styles.emptyText} style={{ marginBottom: 16 }}>Agrega un familiar para comenzar a monitorizar sus constantes fisiológicas.</div>
              {canCreatePatient && <Button size="sm" onClick={() => setModalOpen(true)}>Vincular Familiar</Button>}
            </div>
          ) : (
            <>
              {/* Grid de Métricas */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <div className={`${styles.metricIcon} ${styles.metricIconRed}`}><Heart size={18} /></div>
                    <span className={`${styles.metricBadge} ${tieneDatos && stats.ultimoPulso ? styles.metricBadgeActive : styles.metricBadgeIdle}`}>
                      {tieneDatos && stats.ultimoPulso ? 'Activo' : 'Sin datos'}
                    </span>
                  </div>
                  <div className={styles.metricValue}>
                    {tieneDatos && stats.ultimoPulso ? stats.ultimoPulso : '--'}<span className={styles.metricUnit}>BPM</span>
                  </div>
                  <div className={styles.metricLabel}>Frecuencia Cardíaca</div>
                  {stats?.promedioPulso && <div className={styles.metricFooter}>Promedio {Math.round(stats.promedioPulso)} BPM</div>}
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <div className={`${styles.metricIcon} ${styles.metricIconCyan}`}><Thermometer size={18} /></div>
                    <span className={`${styles.metricBadge} ${tieneDatos && stats.ultimaTemperatura ? styles.metricBadgeActive : styles.metricBadgeIdle}`}>{tieneDatos ? 'Estable' : 'Sin datos'}</span>
                  </div>
                  <div className={styles.metricValue}>
                    {tieneDatos && stats.ultimaTemperatura ? stats.ultimaTemperatura.toFixed(1) : '--'}<span className={styles.metricUnit}>°C</span>
                  </div>
                  <div className={styles.metricLabel}>Temperatura</div>
                  {stats?.promedioTemperatura && <div className={styles.metricFooter}>Promedio {stats.promedioTemperatura.toFixed(1)}°C</div>}
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <div className={`${styles.metricIcon} ${styles.metricIconPurple}`}><Droplets size={18} /></div>
                    <span className={`${styles.metricBadge} ${tieneDatos && stats.ultimaSudoracion ? (stats.ultimaSudoracion > 50 ? styles.metricBadgeWarn : styles.metricBadgeActive) : styles.metricBadgeIdle}`}>
                      {tieneDatos && stats.ultimaSudoracion ? (stats.ultimaSudoracion > 50 ? 'Elevada' : 'Normal') : 'Sin datos'}
                    </span>
                  </div>
                  <div className={styles.metricValue}>
                    {tieneDatos && stats.ultimaSudoracion ? stats.ultimaSudoracion.toFixed(1) : '--'}<span className={styles.metricUnit}>GSR</span>
                  </div>
                  <div className={styles.metricLabel}>Sudoración dérmica</div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricTop}>
                    <div className={`${styles.metricIcon} ${!riesgoIA ? styles.metricIconGreen : riesgoAccent === 'yellow' ? styles.metricIconYellow : styles.metricIconGreen}`}><Brain size={18} /></div>
                    <span className={`${styles.metricBadge} ${!riesgoIA ? styles.metricBadgeIdle : riesgoIA === 'Crítico' ? styles.metricBadgeWarn : styles.metricBadgeActive}`}>
                      {riesgoIA || 'Sin datos'}
                    </span>
                  </div>
                  <div className={styles.metricValue}>
                    {riesgoIA || '--'}
                  </div>
                  <div className={styles.metricLabel}>Evaluación IRME (IA)</div>
                  {stats?.totalLecturas !== undefined && <div className={styles.metricFooter}>{stats.totalLecturas} lecturas auditadas</div>}
                </div>
              </div>

              {/* Gráficos e Historial */}
              <div className={styles.chartsRow}>
                <div className={styles.chartCard}>
                  <div className={styles.chartHeader}>
                    <div>
                      <div className={styles.chartTitle}>Monitoreo Continuo 24 Horas</div>
                      <div className={styles.chartSubtitle}>Historial de pulso y temperatura corporal</div>
                    </div>
                    <div className={styles.legend}>
                      <span className={styles.legendItem}><span className={styles.legendDot} style={{ background: 'var(--color-danger)' }} />Pulso</span>
                      <span className={styles.legendItem}><span className={styles.legendDot} style={{ background: 'var(--color-blue)' }} />Temp</span>
                    </div>
                  </div>
                  {tendencias.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}><Activity size={22} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} /></div>
                      <div className={styles.emptyTitle}>Sin datos históricos</div>
                      <div className={styles.emptyText}>La telemetría aparecerá una vez se vinculen los sensores</div>
                    </div>
                  ) : (
                    <div style={{ height: 250, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={tendencias} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                          <XAxis dataKey="timestamp" stroke="var(--color-text-muted)" fontSize={11} tickFormatter={(val) => val ? String(val).slice(11, 16) || String(val) : ''} />
                          <YAxis yAxisId="left" stroke="var(--color-danger)" fontSize={11} domain={[40, 180]} />
                          <YAxis yAxisId="right" orientation="right" stroke="var(--color-blue)" fontSize={11} domain={[34, 42]} />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'var(--color-bg-card)', borderColor: 'var(--color-border)', borderRadius: 10, color: 'var(--color-text-primary)', fontSize: 12 }}
                            formatter={(value, name) => {
                              const metric = String(name ?? '');
                              return [
                                `${value} ${metric === 'pulsoBpm' ? 'BPM' : '°C'}`,
                                metric === 'pulsoBpm' ? 'Pulso Cardíaco' : 'Temperatura'
                              ];
                            }}
                          />
                          <Line yAxisId="left" type="monotone" dataKey="pulsoBpm" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                          <Line yAxisId="right" type="monotone" dataKey="temperaturaC" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                </div>

                <div className={styles.chartCard} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div className={styles.chartTitle}>Emergencias y Ubicación</div>
                    <div className={styles.chartSubtitle}>Última ubicación autorizada recibida por el backend</div>
                  </div>
                  {stats?.estadoActual === 'Critico' ? (
                    <div style={{ flexGrow: 1, background: 'var(--color-danger-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                      <AlertTriangle size={32} style={{ color: 'var(--color-danger)' }} />
                      <div style={{ fontWeight: 700, color: 'var(--color-danger)' }}>¡Alerta Fisiológica Activa!</div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                        {tracking ? `${tracking.latitud.toFixed(5)}, ${tracking.longitud.toFixed(5)} · ${new Date(tracking.timestamp).toLocaleString('es-MX')}` : 'No hay una ubicación sincronizada disponible.'}
                      </p>
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}><Shield size={22} style={{ color: 'var(--color-emerald)', opacity: 0.5 }} /></div>
                      <div className={styles.emptyTitle}>{stats ? 'Sin alerta crítica registrada' : 'Estado no disponible'}</div>
                      <div className={styles.emptyText}>{stats ? 'El backend no reporta una emergencia activa.' : 'No fue posible consultar el estado actual.'}</div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* RENDER PACIENTE HUB */}
      {isPatient && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginTop: 12 }}>
          {/* Medicación */}
          <div className={styles.chartCard} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Calendar size={18} style={{ color: 'var(--color-blue)' }} />
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>Toma de Medicamentos</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Marca tus dosis diarias para notificar a tus cuidadores</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {medicamentos.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button aria-label={`Registrar toma de ${m.nombre}`} onClick={() => handleToggleMed(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <CheckCircle size={22} style={{ color: m.tomado ? 'var(--color-emerald)' : 'var(--color-text-muted)' }} />
                    </button>
                    <div>
                      <div style={{ fontWeight: 600, color: m.tomado ? 'var(--color-text-muted)' : 'var(--color-text-primary)', textDecoration: m.tomado ? 'line-through' : 'none' }}>{m.nombre}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Dosis: {m.dosis} · Hora: {m.hora}</div>
                    </div>
                  </div>
                  <Clock size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Cuidadores Vinculados & Dispositivo Widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Widget Dispositivo */}
            <div className={styles.chartCard} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center' }}>
              <QrCode size={36} style={{ color: 'var(--color-blue)', marginBottom: 12 }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>Vinculación del Reloj</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 16 }}>Usa este código de acceso en la aplicación móvil para asociar al paciente.</p>
              <div style={{ padding: '8px 16px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)', borderRadius: 8, display: 'inline-block', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-blue)' }}>
                {paciente?.codigoAccesoQr || paciente?.CodigoAccesoQr || paciente?.CodigoAccesoQR || 'Sin código disponible'}
              </div>
            </div>

            {/* Cuidadores Autorizados */}
            <div className={styles.chartCard} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Users size={18} style={{ color: 'var(--color-blue)' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700 }}>Mis Cuidadores</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cuidadores.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{c.nombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{c.rol}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {canCreatePatient && <PacienteModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => queryClient.invalidateQueries({ queryKey: ['paciente'] })} />}
    </div>
  );
}
