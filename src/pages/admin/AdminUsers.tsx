import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Card, toast, TableSkeleton } from '../../components/ui';
import { Search, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import httpClient from '../../utils/httpClient';
import styles from './Admin.module.css';

interface AdminUser {
  id: string;
  correo: string;
  nombre: string;
  activo: boolean;
  plan: string;
  fechaRegistro: string;
}

interface UsuariosResponse {
  usuarios: AdminUser[];
  total: number;
  pagina: number;
  porPagina: number;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pausingUser, setPausingUser] = useState<AdminUser | null>(null);
  const [pauseReason, setPauseReason] = useState('');

  const usersQuery = useQuery({
    queryKey: ['admin', 'usuarios', page, searchQuery],
    queryFn: () => httpClient.get<UsuariosResponse>(
      `/api/Admin/usuarios?correo=${encodeURIComponent(searchQuery)}&pagina=${page}&porPagina=10`
    ).then(r => r.data),
  });
  const users = usersQuery.data?.usuarios ?? [];
  const total = usersQuery.data?.total ?? 0;
  const loading = usersQuery.isPending;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
    setPage(1);
  };

  const toggleMutation = useMutation({
    mutationFn: (vars: { user: AdminUser; Pausar: boolean; Motivo: string }) =>
      httpClient.put(`/api/Admin/usuarios/${vars.user.id}/pausar`, { Pausar: vars.Pausar, Motivo: vars.Motivo }),
    onSuccess: (_d, vars) => {
      if (vars.Pausar) {
        toast.success(`Cuenta de ${vars.user.nombre} pausada correctamente.`);
        setPausingUser(null);
        setPauseReason('');
      } else {
        toast.success(`Cuenta de ${vars.user.nombre} reactivada correctamente.`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] });
    },
    onError: (err, vars) => {
      toast.error(err?.message || (vars.Pausar ? 'Error al pausar cuenta.' : 'Error al reactivar cuenta.'));
    },
  });

  const handleToggleState = (user: AdminUser) => {
    if (user.activo) {
      // Abrir modal para ingresar motivo de pausa
      setPausingUser(user);
      setPauseReason('');
    } else {
      // Reactivar cuenta directamente
      toggleMutation.mutate({ user, Pausar: false, Motivo: '' });
    }
  };

  const submitPause = () => {
    if (!pausingUser) return;
    if (!pauseReason) {
      toast.error('Debes proporcionar un motivo para pausar la cuenta.');
      return;
    }
    toggleMutation.mutate({ user: pausingUser, Pausar: true, Motivo: pauseReason });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestión de Cuentas y Usuarios</h1>
      <p className={styles.subtitle}>Supervisión de suscripciones, estados de cuentas web y bloqueo de accesos de BioGuard.</p>

      {/* Buscador */}
      <Card style={{ padding: 18, marginBottom: 20 }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12 }}>
          <div style={{ flexGrow: 1 }}>
            <Input
              placeholder="Buscar por correo electrónico..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={16} />}
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
      </Card>

      {/* Tabla de Usuarios */}
      <Card style={{ overflowX: 'auto', padding: 0 }}>
        {loading ? (
          <div style={{ padding: 24 }}><TableSkeleton rows={5} cols={5} /></div>
        ) : users.length === 0 ? (
          <p style={{ padding: 24, textAlign: 'center', color: '#8E9CB8' }}>No se encontraron usuarios.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Registro</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.nombre}</td>
                  <td>{u.correo}</td>
                  <td>
                    <span className={styles.planBadge}>{u.plan}</span>
                  </td>
                  <td>
                    <span className={`${styles.statusDot} ${u.activo ? styles.statusActive : styles.statusInactive}`}>
                      {u.activo ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td style={{ color: '#8E9CB8', fontSize: '0.8rem' }}>
                    {new Date(u.fechaRegistro).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={styles.toggleStateBtn}
                      onClick={() => handleToggleState(u)}
                      title={u.activo ? 'Suspender cuenta' : 'Reactivar cuenta'}
                    >
                      {u.activo ? (
                        <ToggleRight size={24} style={{ color: '#ff5252' }} />
                      ) : (
                        <ToggleLeft size={24} style={{ color: '#00e676' }} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Paginación */}
      {total > 10 && (
        <div className={styles.pagination}>
          <Button
            variant="ghost"
            disabled={page === 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <span style={{ color: '#8E9CB8', fontSize: '0.9rem' }}>
            Página {page} de {Math.ceil(total / 10)}
          </span>
          <Button
            variant="ghost"
            disabled={page * 10 >= total || loading}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Modal para ingresar motivo de suspensión */}
      {pausingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={24} style={{ color: '#ff5252' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Suspender Cuenta</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#8E9CB8', marginBottom: 16 }}>
              Estás a punto de suspender temporalmente la cuenta de <strong>{pausingUser.nombre}</strong> ({pausingUser.correo}).
            </p>
            <div className={styles.formGroup}>
              <label>Motivo de la suspensión</label>
              <textarea
                className={styles.textarea}
                placeholder="Ej. Incumplimiento de términos o fraude detectado en facturación..."
                value={pauseReason}
                maxLength={500}
                onChange={(e) => setPauseReason(e.target.value)}
              />
            </div>
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setPausingUser(null)}>
                Cancelar
              </Button>
              <Button
                loading={toggleMutation.isPending}
                onClick={submitPause}
                style={{ background: '#ff5252' }}
              >
                Confirmar Suspensión
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
