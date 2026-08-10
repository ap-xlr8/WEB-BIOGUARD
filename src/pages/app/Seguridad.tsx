import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User, UserPlus, QrCode, Copy, Activity, Key, Check, X, Lock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { LoadingSpinner } from '../../components/ui';
import { usuarioService, pacienteService, cuidadorService } from '../../services';
import { PacienteResponse, CuidadorResponse, AuditoriaResponse } from '../../types';
import httpClient from '../../utils/httpClient';
import styles from './Seguridad.module.css';
import { useAuth } from '../../context';
import { APP_PERMISSIONS, hasPermission } from '../../auth/authorization';

const QR_LOGIN_URL = (import.meta.env.VITE_APP_URL || window.location.origin) + '/login?code=';

export default function SeguridadPage() {
  const queryClient = useQueryClient();
  const { access } = useAuth();
  const canReadPatient = hasPermission(access, APP_PERMISSIONS.PATIENT_READ);
  const canManageCaregivers = hasPermission(access, APP_PERMISSIONS.CAREGIVER_MANAGE);

  const [copied, setCopied] = useState(false);
  const [patCopied, setPatCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cuidForm, setCuidForm] = useState({ nombre: '', parentesco: '', telefono: '', correo: '' });
  const [cuidError, setCuidError] = useState('');
  const [showCredenciales, setShowCredenciales] = useState<CuidadorResponse | null>(null);
  const [showPatientQR, setShowPatientQR] = useState(false);
  const [editCuidador, setEditCuidador] = useState<CuidadorResponse | null>(null);
  const [editForm, setEditForm] = useState({ nombre: '', parentesco: '' });
  const [cuidCopied, setCuidCopied] = useState(false);

  const perfilQuery = useQuery({
    queryKey: ['usuario', 'perfil'],
    queryFn: () => usuarioService.miPerfil(),
  });

  const pacienteQuery = useQuery({
    queryKey: ['paciente'],
    queryFn: () => access?.pacienteId
      ? pacienteService.getById(access.pacienteId)
      : pacienteService.miPaciente(),
    enabled: canReadPatient || canManageCaregivers,
  });
  const paciente: PacienteResponse | null = pacienteQuery.data ?? null;
  const pacienteId = paciente?.id;

  const cuidadoresQuery = useQuery({
    queryKey: ['cuidadores', pacienteId],
    queryFn: () => cuidadorService.getByPaciente(pacienteId!),
    enabled: !!pacienteId && canManageCaregivers,
  });

  const pacienteQRQuery = useQuery({
    queryKey: ['paciente-qr', pacienteId],
    queryFn: () => httpClient.get(`/api/Pacientes/${pacienteId}/qr`).then(r => r.data?.codigoAccesoQr || ''),
    enabled: !!pacienteId && canManageCaregivers,
  });

  const auditoriaQuery = useQuery({
    queryKey: ['auditoria'],
    queryFn: () => httpClient.get('/api/Auditoria?pagina=1&porPagina=20').then(r => r.data as AuditoriaResponse[]),
  });

  const cuidadorQrQuery = useQuery({
    queryKey: ['cuidador-qr', showCredenciales?.id],
    queryFn: () => httpClient.get(`/api/Cuidadores/${showCredenciales!.id}/qr`).then(r => r.data?.codigoAccesoQr || ''),
    enabled: !!showCredenciales && canManageCaregivers,
  });

  const cuidadores = cuidadoresQuery.data ?? [];
  const auditoria = auditoriaQuery.data ?? [];
  const pacienteQR = pacienteQRQuery.data ?? '';
  const qrCode = cuidadorQrQuery.data || showCredenciales?.codigoAccesoQr || '';

  const failed: string[] = [];
  if (perfilQuery.isError) failed.push('Perfil de usuario');
  if (auditoriaQuery.isError) failed.push('Registros de auditoría');
  if (pacienteQuery.isError) failed.push('Datos del paciente');
  if (cuidadoresQuery.isError) failed.push('Cuidadores');
  if (pacienteQRQuery.isError) failed.push('Código de acceso QR');
  const loadError = failed.length > 0
    ? `No se pudieron cargar algunas secciones: ${failed.join(', ')}. Verifica tu conexión.`
    : '';

  const crearCuidadorMutation = useMutation({
    mutationFn: () => cuidadorService.crear({
      pacienteId: pacienteId!,
      nombre: cuidForm.nombre,
      parentesco: cuidForm.parentesco,
      telefono: cuidForm.telefono,
      correo: cuidForm.correo,
    }),
    onMutate: () => setCuidError(''),
    onSuccess: () => {
      setShowModal(false);
      setCuidForm({ nombre: '', parentesco: '', telefono: '', correo: '' });
      queryClient.invalidateQueries({ queryKey: ['cuidadores', pacienteId] });
    },
    onError: (err) => {
      setCuidError(err.message || 'Error al crear cuidador');
    },
  });

  const editarCuidadorMutation = useMutation({
    mutationFn: () => cuidadorService.editar(editCuidador!.id, editForm),
    onSuccess: () => {
      setEditCuidador(null);
      queryClient.invalidateQueries({ queryKey: ['cuidadores', pacienteId] });
    },
    onError: (err) => {
      console.error('Error al editar cuidador:', err);
    },
  });

  const regenerarQrMutation = useMutation({
    mutationFn: () => httpClient.post(`/api/Cuidadores/${showCredenciales!.id}/regenerar-qr`).then(r => r.data?.codigoAccesoQr || ''),
    onSuccess: (newCode) => {
      if (showCredenciales) queryClient.setQueryData(['cuidador-qr', showCredenciales.id], newCode);
    },
    onError: (err) => {
      console.error('Error al regenerar QR:', err);
    },
  });

  const handleCopyKey = async () => {
    const text = pacienteQR;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCaregiver = () => {
    if (!paciente) return;
    if (!cuidForm.nombre || !cuidForm.parentesco || !cuidForm.telefono || !cuidForm.correo) {
      setCuidError('Todos los campos son obligatorios');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(cuidForm.correo)) {
      setCuidError('Correo inválido');
      return;
    }
    crearCuidadorMutation.mutate();
  };

  const handleSaveEdit = () => {
    if (!editCuidador || !editForm.nombre || !editForm.parentesco) return;
    editarCuidadorMutation.mutate();
  };

  const handleOpenEdit = (cuidador: CuidadorResponse) => {
    setEditCuidador(cuidador);
    setEditForm({ nombre: cuidador.nombre, parentesco: cuidador.parentesco });
  };

  const handleShowCredenciales = (cuidador: CuidadorResponse) => {
    setShowCredenciales(cuidador);
  };

  const getStatusBadge = (accion: string) => {
    const a = accion.toLowerCase();
    if (a.includes('login') || a.includes('registro')) return 'success';
    if (a.includes('fallo') || a.includes('error')) return 'warning';
    return 'info';
  };

  const getEventIcon = (accion: string) => {
    const a = accion.toLowerCase();
    if (a.includes('login')) return <Key size={14} />;
    if (a.includes('registro')) return <UserPlus size={14} />;
    return <Activity size={14} />;
  };

  if (perfilQuery.isLoading && pacienteQuery.isLoading) return <LoadingSpinner />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Consola de Seguridad y Vinculación Activa</h1>
      <p className={styles.subtitle}>
        Gestión de identidad, cifrado, pacientes vinculados y registro de actividad
      </p>

      {loadError && (
        <div style={{ marginBottom: 20, padding: '12px 18px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 10, color: '#ef4444', fontSize: '0.85rem' }}>
          {loadError}
        </div>
      )}

      <div className={styles.mainGrid}>
        {/* Left: Cifrado */}
        <div className={`${styles.card} ${styles.cipherCard}`}>
          <div className={styles.cipherIcon}>
            <Lock size={32} />
          </div>
          <div className={styles.cipherLabel}>Conexión HTTPS y acceso autorizado</div>
          <div className={styles.cipherValue}>256-bit</div>
          <div className={styles.cipherDesc}>
            Protocolo AES-256 con intercambio de claves HMAC-SHA256. Todos los datos biométricos están protegidos con cifrado de grado militar.
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: '100%' }} />
          </div>
          <div className={styles.progressLabel}>Conexión segura activa</div>
        </div>

        {/* Right: Patient + bottom row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Patient card */}
          <div className={styles.card}>
            {paciente ? (
              <div className={styles.patientCard}>
                <div className={styles.patientAvatar}>
                  {paciente.nombre.charAt(0).toUpperCase()}
                </div>
                <div className={styles.patientInfo}>
                  <div className={styles.patientName}>{paciente.nombre}</div>
                  <div className={styles.patientId}>ID: {paciente.id.slice(0, 12)}...</div>
                  <div className={styles.patientDate}>Vinculado: {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                  <div className={styles.badge}>
                    <span className={styles.badgeDot} /> Vínculo principal
                  </div>
                </div>
                {canManageCaregivers && <div className={styles.patientActions}>
                  <button className={styles.actionBtn} onClick={() => setShowPatientQR(true)}>
                    <QrCode size={14} style={{ marginRight: 4 }} /> Ver QR
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={handleCopyKey}
                    style={{
                      background: copied ? 'rgba(0,230,118,0.12)' : '',
                      borderColor: copied ? 'rgba(0,230,118,0.3)' : '',
                      color: copied ? '#00e676' : '',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {copied ? <Check size={14} style={{ marginRight: 4 }} /> : <Copy size={14} style={{ marginRight: 4 }} />}
                    {copied ? 'Copiado' : 'Copiar clave'}
                  </button>
                </div>}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: '#8E9CB8' }}>
                <User size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <div>Sin paciente vinculado</div>
                <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Ve al Dashboard para crear uno</div>
              </div>
            )}
          </div>

          {/* Bottom row */}
          {canManageCaregivers && <div className={styles.bottomRow}>
            {/* Caregiver */}
            <div className={styles.card}>
              {cuidadores.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: 8 }}>
                  <div className={styles.caregiverAvatar}>
                    <User size={22} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className={styles.caregiverName}>{cuidadores[0].nombre}</div>
                    <div className={styles.caregiverPerm}>{cuidadores[0].parentesco} · Acceso completo</div>
                  </div>
                  <div className={styles.caregiverActions} style={{ marginTop: 4 }}>
                    <button className={styles.smallBtn} onClick={() => handleOpenEdit(cuidadores[0])}>Asignar</button>
                    <button className={styles.smallBtn} onClick={() => handleShowCredenciales(cuidadores[0])}><Key size={13} style={{ marginRight: 3 }} />Credenciales</button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 20, color: '#8E9CB8' }}>
                  <User size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                  <div style={{ fontSize: '0.85rem' }}>Sin cuidador asignado</div>
                </div>
              )}
            </div>

            {/* Add caregiver button */}
            <button className={styles.addCard} onClick={() => { if (paciente) setShowModal(true); }}>
              <UserPlus size={28} />
              Añadir Cuidador
            </button>
          </div>}
        </div>
      </div>

      {/* Activity table */}
      <div className={`${styles.card} ${styles.activityCard}`}>
        <div className={styles.activityTitle}>Registro de actividad reciente</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Evento</th>
              <th>Origen</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {auditoria.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.emptyRow}>Sin actividad registrada</td>
              </tr>
            ) : (
              auditoria.slice(0, 10).map((a) => {
                const badge = getStatusBadge(a.accion);
                return (
                  <tr key={a.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.eventCell}>
                        <div className={styles.eventIcon} style={{ background: badge === 'success' ? 'rgba(0,230,118,0.1)' : badge === 'warning' ? 'rgba(255,215,64,0.1)' : 'rgba(45,156,255,0.1)', color: badge === 'success' ? '#00e676' : badge === 'warning' ? '#ffd740' : '#2D9CFF' }}>
                          {getEventIcon(a.accion)}
                        </div>
                        {a.accion}
                      </div>
                    </td>
                    <td style={{ color: '#8E9CB8' }}>{a.tablaAfectada}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${badge === 'success' ? styles.statusSuccess : badge === 'warning' ? styles.statusWarning : styles.statusInfo}`}>
                        <span className={styles.statusDot} style={{ background: badge === 'success' ? '#00e676' : badge === 'warning' ? '#ffd740' : '#2D9CFF' }} />
                        {a.accion.toLowerCase().includes('login') ? 'Exitoso' : a.accion.toLowerCase().includes('registro') ? 'Completado' : 'Activo'}
                      </span>
                    </td>
                    <td style={{ color: '#8E9CB8', fontSize: '0.8rem' }}>
                      {new Date(a.fecha).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && canManageCaregivers && (
        <div role="presentation" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => { if (!crearCuidadorMutation.isPending) setShowModal(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="add-caregiver-title" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 28, maxWidth: 440, width: '100%', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 id="add-caregiver-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Añadir cuidador</h3>
              <button type="button" aria-label="Cerrar" onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input aria-label="Nombre completo" placeholder="Nombre completo" value={cuidForm.nombre} onChange={e => setCuidForm({...cuidForm, nombre: e.target.value})} maxLength={120} autoComplete="name" style={{ padding: '10px 14px', background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)', fontSize: '0.88rem' }} />
              <input aria-label="Parentesco" placeholder="Parentesco (Madre, Padre, etc)" value={cuidForm.parentesco} onChange={e => setCuidForm({...cuidForm, parentesco: e.target.value})} maxLength={80} autoComplete="off" style={{ padding: '10px 14px', background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)', fontSize: '0.88rem' }} />
              <input aria-label="Teléfono" placeholder="Teléfono" type="tel" inputMode="tel" value={cuidForm.telefono} onChange={e => setCuidForm({...cuidForm, telefono: e.target.value})} maxLength={20} autoComplete="tel" style={{ padding: '10px 14px', background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)', fontSize: '0.88rem' }} />
              <input aria-label="Correo electrónico" placeholder="Correo electrónico" type="email" value={cuidForm.correo} onChange={e => setCuidForm({...cuidForm, correo: e.target.value})} maxLength={254} autoComplete="email" style={{ padding: '10px 14px', background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)', fontSize: '0.88rem' }} />
              {cuidError && <span style={{ color: '#ff5252', fontSize: '0.82rem' }}>{cuidError}</span>}
              <button onClick={handleAddCaregiver} disabled={crearCuidadorMutation.isPending} style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #2D9CFF, #8FD7FF)', border: 'none', borderRadius: 12, color: '#07111D', cursor: crearCuidadorMutation.isPending ? 'default' : 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4, opacity: crearCuidadorMutation.isPending ? 0.7 : 1 }}>
                {crearCuidadorMutation.isPending ? 'Guardando...' : 'Guardar Cuidador'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCredenciales && canManageCaregivers && (
        <div role="presentation" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => { setShowCredenciales(null); setCuidCopied(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="caregiver-credentials-title" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 28, maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 id="caregiver-credentials-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Credenciales de acceso</h3>
              <button type="button" aria-label="Cerrar" onClick={() => { setShowCredenciales(null); setCuidCopied(false); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ marginBottom: 8, color: '#F5F7FA', fontWeight: 600, fontSize: '0.95rem' }}>{showCredenciales.nombre}</div>
            <div style={{ fontSize: '0.8rem', color: '#8E9CB8', marginBottom: 20 }}>Escanee este QR desde la app móvil para iniciar sesión</div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, display: 'inline-block' }}>
              <QRCodeSVG value={QR_LOGIN_URL + qrCode} size={180} level="H" title="QR de acceso" />
            </div>
            <div style={{ background: 'rgba(45,156,255,0.06)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', color: '#8E9CB8', marginBottom: 6 }}>Código de acceso</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 600, color: '#2D9CFF', letterSpacing: 2 }}>{qrCode}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => { navigator.clipboard.writeText(qrCode); setCuidCopied(true); setTimeout(() => setCuidCopied(false), 2000); }} className={styles.smallBtn} style={{ padding: '8px 16px', fontSize: '0.85rem', background: cuidCopied ? 'rgba(0,230,118,0.15)' : '', borderColor: cuidCopied ? '#00e676' : '', color: cuidCopied ? '#00e676' : '' }}>
                {cuidCopied ? 'Copiado!' : 'Copiar código'}
              </button>
              <button onClick={() => regenerarQrMutation.mutate()} className={styles.smallBtn} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Regenerar QR</button>
            </div>
          </div>
        </div>
      )}

      {editCuidador && canManageCaregivers && (
        <div role="presentation" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setEditCuidador(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="edit-caregiver-title" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 28, maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 id="edit-caregiver-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Editar cuidador</h3>
              <button type="button" aria-label="Cerrar" onClick={() => setEditCuidador(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input aria-label="Nombre del cuidador" placeholder="Nombre" value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} maxLength={120} autoComplete="name" style={{ padding: '10px 14px', background: 'rgba(45,156,255,0.04)', border: '1px solid rgba(45,156,255,0.15)', borderRadius: 10, color: '#F5F7FA', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', outline: 'none' }} />
              <input aria-label="Parentesco del cuidador" placeholder="Parentesco" value={editForm.parentesco} onChange={e => setEditForm({...editForm, parentesco: e.target.value})} maxLength={80} autoComplete="off" style={{ padding: '10px 14px', background: 'rgba(45,156,255,0.04)', border: '1px solid rgba(45,156,255,0.15)', borderRadius: 10, color: '#F5F7FA', fontFamily: 'var(--font-sans)', fontSize: '0.88rem', outline: 'none' }} />
              <button onClick={handleSaveEdit} style={{ padding: '12px 20px', background: 'linear-gradient(135deg, #2D9CFF, #8FD7FF)', border: 'none', borderRadius: 12, color: '#07111D', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      {showPatientQR && paciente && canManageCaregivers && (
        <div role="presentation" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => { setShowPatientQR(false); setPatCopied(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="patient-qr-title" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 28, maxWidth: 400, width: '100%', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 id="patient-qr-title" style={{ fontSize: '1.1rem', fontWeight: 600 }}>QR de acceso - {paciente.nombre}</h3>
              <button type="button" aria-label="Cerrar" onClick={() => { setShowPatientQR(false); setPatCopied(false); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#8E9CB8', marginBottom: 20 }}>Escanea este QR en la app movil para vincular al paciente</div>
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, display: 'inline-block' }}>
              <QRCodeSVG value={QR_LOGIN_URL + pacienteQR} size={180} level="H" title="QR del paciente" />
            </div>
            <div style={{ background: 'rgba(45,156,255,0.06)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ fontSize: '0.78rem', color: '#8E9CB8', marginBottom: 6 }}>Clave de acceso</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 600, color: '#2D9CFF', letterSpacing: 2 }}>{pacienteQR}</div>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(pacienteQR); setPatCopied(true); setTimeout(() => setPatCopied(false), 2000); }} className={styles.smallBtn} style={{ padding: '8px 16px', fontSize: '0.85rem', background: patCopied ? 'rgba(0,230,118,0.15)' : '', borderColor: patCopied ? '#00e676' : '', color: patCopied ? '#00e676' : '' }}>
              {patCopied ? 'Copiado!' : 'Copiar clave'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
