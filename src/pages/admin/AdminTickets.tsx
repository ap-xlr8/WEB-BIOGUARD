import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, TableSkeleton } from '../../components/ui';
import { AlertCircle, CheckCircle, Clock, Inbox } from 'lucide-react';
import httpClient from '../../utils/httpClient';
import styles from './Admin.module.css';

interface AdminTicket {
  id: string;
  usuarioId: string;
  asunto: string;
  estado: string;
  fechaCreacion: string;
}

export default function AdminTicketsPage() {
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null);
  const [estadoFilter, setEstadoFilter] = useState('');

  const ticketsQuery = useQuery({
    queryKey: ['admin', 'tickets', estadoFilter],
    queryFn: () => {
      const params = estadoFilter ? { estado: estadoFilter } : undefined;
      return httpClient.get<AdminTicket[]>('/api/Admin/tickets', { params }).then((response) => response.data || []);
    },
  });
  const tickets = ticketsQuery.data ?? [];

  const getStatusIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'abierto': return <AlertCircle size={14} style={{ color: 'var(--color-blue)' }} aria-hidden="true" />;
      case 'resuelto':
      case 'cerrado': return <CheckCircle size={14} style={{ color: 'var(--color-emerald)' }} aria-hidden="true" />;
      default: return <Clock size={14} style={{ color: 'var(--color-warning)' }} aria-hidden="true" />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.ticketsHeader}>
        <div>
          <h1 className={styles.title}>Tickets de soporte</h1>
          <p className={styles.subtitle}>Consulta de casos registrados en el backend.</p>
        </div>
        <label>
          <span className="sr-only">Filtrar por estado</span>
          <select className={styles.adminSelect} value={estadoFilter} onChange={(event) => setEstadoFilter(event.target.value)}>
            <option value="">Todos los estados</option>
            <option value="abierto">Abiertos</option>
            <option value="en_proceso">En proceso</option>
            <option value="resuelto">Resueltos</option>
          </select>
        </label>
      </div>

      {ticketsQuery.isError && <Card style={{ padding: 24 }}>No fue posible consultar los tickets.</Card>}

      <div className={styles.splitLayout}>
        <div className={styles.ticketsList}>
          {ticketsQuery.isPending ? (
            <TableSkeleton rows={4} cols={2} />
          ) : tickets.length === 0 ? (
            <Card style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Inbox size={32} aria-hidden="true" style={{ marginBottom: 12, opacity: 0.5 }} />
              <p>No hay tickets para el filtro seleccionado.</p>
            </Card>
          ) : (
            <div className={styles.ticketGrid}>
              {tickets.map((ticket) => (
                <button
                  type="button"
                  key={ticket.id}
                  className={`${styles.ticketItem} ${selectedTicket?.id === ticket.id ? styles.ticketItemActive : ''}`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <span className={styles.ticketId}>ID: {ticket.id.slice(0, 8)}</span>
                  <span className={styles.ticketStatusBadge}>{getStatusIcon(ticket.estado)} {ticket.estado.toUpperCase()}</span>
                  <strong className={styles.ticketAsunto}>{ticket.asunto}</strong>
                  <small>{new Date(ticket.fechaCreacion).toLocaleString('es-MX')}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.ticketDetail}>
          {selectedTicket ? (
            <Card style={{ padding: 24 }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: 18 }}>{selectedTicket.asunto}</h2>
              <dl className={styles.ticketFacts}>
                <dt>Estado</dt><dd>{selectedTicket.estado}</dd>
                <dt>Usuario</dt><dd>{selectedTicket.usuarioId}</dd>
                <dt>Creado</dt><dd>{new Date(selectedTicket.fechaCreacion).toLocaleString('es-MX')}</dd>
                <dt>Ticket</dt><dd>{selectedTicket.id}</dd>
              </dl>
            </Card>
          ) : (
            <div className={styles.detailPlaceholder}>
              <Inbox size={40} aria-hidden="true" style={{ color: 'var(--color-text-muted)', opacity: 0.35, marginBottom: 12 }} />
              <p>Selecciona un ticket para consultar los datos disponibles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
