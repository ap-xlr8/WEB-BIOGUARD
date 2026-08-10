import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Card, toast, TableSkeleton } from '../../components/ui';
import { Plus, MessageCircle, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import httpClient from '../../utils/httpClient';
import styles from './Soporte.module.css';

interface Ticket {
  id: string;
  asunto: string;
  descripcion: string;
  categoria: string;
  prioridad: string;
  estado: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export default function SoportePage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({ asunto: '', descripcion: '', categoria: 'soporte_general', prioridad: 'normal' });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const ticketsQuery = useQuery({
    queryKey: ['tickets'],
    queryFn: () => httpClient.get<Ticket[]>('/api/Tickets/mis-tickets').then(r => r.data),
  });
  const tickets = ticketsQuery.data ?? [];

  const crearTicketMutation = useMutation({
    mutationFn: () => httpClient.post('/api/Tickets', newForm),
    onSuccess: () => {
      toast.success('Ticket creado exitosamente.');
      setNewForm({ asunto: '', descripcion: '', categoria: 'soporte_general', prioridad: 'normal' });
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: () => {
      toast.error('Error al crear el ticket de soporte.');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.asunto || !newForm.descripcion) {
      toast.error('Asunto y descripción son obligatorios.');
      return;
    }
    crearTicketMutation.mutate();
  };

  const getStatusIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'abierto':
        return <AlertCircle size={16} style={{ color: '#00e5ff' }} />;
      case 'en_proceso':
        return <Clock size={16} style={{ color: '#ffd740' }} />;
      case 'resuelto':
      case 'cerrado':
        return <CheckCircle size={16} style={{ color: '#00e676' }} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getPriorityStyle = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case 'alta':
        return { color: '#ff5252', background: 'rgba(255,82,82,0.1)' };
      case 'baja':
        return { color: '#8E9CB8', background: 'rgba(255,255,255,0.05)' };
      default:
        return { color: '#00e5ff', background: 'rgba(0,229,255,0.1)' };
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Centro de Soporte Técnico</h1>
          <p className={styles.subtitle}>Escríbenos si tienes alguna duda técnica o comercial con la plataforma web o la aplicación móvil.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} style={{ marginRight: 6 }} /> Crear Nuevo Ticket
        </Button>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.listSection}>
          {ticketsQuery.isPending ? (
            <TableSkeleton rows={4} cols={3} />
          ) : tickets.length === 0 ? (
            <Card style={{ padding: 40, textAlign: 'center', color: '#8E9CB8' }}>
              <MessageCircle size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <p>No tienes ningún ticket de soporte activo.</p>
            </Card>
          ) : (
            <div className={styles.ticketGrid}>
              {tickets.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className={`${styles.ticketCard} ${selectedTicket?.id === t.id ? styles.ticketCardActive : ''}`}
                  onClick={() => setSelectedTicket(t)}
                >
                  <div className={styles.ticketCardHeader}>
                    <span className={styles.ticketCategory}>{t.categoria.replace('_', ' ')}</span>
                    <span className={styles.priorityBadge} style={getPriorityStyle(t.prioridad)}>
                      {t.prioridad}
                    </span>
                  </div>
                  <h3 className={styles.ticketAsunto}>{t.asunto}</h3>
                  <p className={styles.ticketDesc}>{t.descripcion}</p>
                  <div className={styles.ticketCardFooter}>
                    <span className={styles.ticketStatus}>
                      {getStatusIcon(t.estado)} {t.estado.toUpperCase()}
                    </span>
                    <span className={styles.ticketDate}>
                      {new Date(t.fechaCreacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalle del Ticket */}
        <div className={styles.detailSection}>
          {selectedTicket ? (
            <Card style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className={styles.detailHeader}>
                <h2>{selectedTicket.asunto}</h2>
                <span className={styles.detailStatus}>
                  {getStatusIcon(selectedTicket.estado)} {selectedTicket.estado.toUpperCase()}
                </span>
              </div>
              <p className={styles.detailDesc}>{selectedTicket.descripcion}</p>

              <div className={styles.messageThread}>
                <div className={styles.threadTitle}>Solicitud registrada</div>
                <div className={`${styles.message} ${styles.messageUser}`}>
                  <div className={styles.messageMeta}>
                    <strong>Creado</strong> · {new Date(selectedTicket.fechaCreacion).toLocaleString('es-MX')}
                  </div>
                  <p className={styles.messageContent}>{selectedTicket.descripcion}</p>
                </div>
              </div>
            </Card>
          ) : (
            <div className={styles.detailPlaceholder}>
              <MessageCircle size={40} style={{ color: '#8E9CB8', opacity: 0.3, marginBottom: 12 }} />
              <p>Selecciona un ticket de soporte para ver su detalle y respuestas administrativas.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Crear Ticket */}
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Crear Ticket de Soporte</h2>
              <button className={styles.closeModalBtn} onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className={styles.formGroup}>
                <label>Asunto</label>
                <Input
                  placeholder="Ej. Error en Stripe al procesar el pago Familiar"
                  value={newForm.asunto}
                  maxLength={160}
                  onChange={(e) => setNewForm({ ...newForm, asunto: e.target.value })}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Categoría</label>
                  <select
                    className={styles.select}
                    value={newForm.categoria}
                    onChange={(e) => setNewForm({ ...newForm, categoria: e.target.value })}
                  >
                    <option value="soporte_general">Soporte General</option>
                    <option value="pagos_facturacion">Pagos / Facturación</option>
                    <option value="wearable_reloj">Reloj Wear OS</option>
                    <option value="cuenta_seguridad">Seguridad / Cuentas</option>
                  </select>
                </div>
                <div className={styles.formGroup} style={{ flex: 1 }}>
                  <label>Prioridad</label>
                  <select
                    className={styles.select}
                    value={newForm.prioridad}
                    onChange={(e) => setNewForm({ ...newForm, prioridad: e.target.value })}
                  >
                    <option value="normal">Normal</option>
                    <option value="baja">Baja</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Descripción detallada</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Detalla los pasos para reproducir el error..."
                  value={newForm.descripcion}
                  maxLength={4000}
                  onChange={(e) => setNewForm({ ...newForm, descripcion: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button loading={crearTicketMutation.isPending}>Crear Ticket</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
