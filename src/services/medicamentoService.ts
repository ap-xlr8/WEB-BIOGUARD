import httpClient from '../utils/httpClient';
import type { AxiosRequestConfig } from 'axios';
import { MedicamentoResponse, CrearMedicamentoRequest, ActualizarMedicamentoRequest, MessageResponse } from '../types';

export const medicamentoService = {
  getByPaciente: async (pacienteId: string, config?: AxiosRequestConfig): Promise<MedicamentoResponse[]> => {
    const { data } = await httpClient.get<MedicamentoResponse[]>(`/api/Medicamentos/by-paciente/${pacienteId}`, config);
    return data;
  },

  getById: async (id: string): Promise<MedicamentoResponse> => {
    const { data } = await httpClient.get<MedicamentoResponse>(`/api/Medicamentos/${id}`);
    return data;
  },

  crear: async (dto: CrearMedicamentoRequest): Promise<{ medicamentoId: string; message: string }> => {
    const { data } = await httpClient.post('/api/Medicamentos', dto);
    return data;
  },

  editar: async (id: string, dto: ActualizarMedicamentoRequest): Promise<MessageResponse> => {
    const { data } = await httpClient.put<MessageResponse>(`/api/Medicamentos/${id}`, dto);
    return data;
  },

  registrarToma: async (id: string): Promise<MessageResponse> => {
    const { data } = await httpClient.put<MessageResponse>(`/api/Medicamentos/${id}/toma`);
    return data;
  },

  eliminar: async (id: string): Promise<void> => {
    await httpClient.delete(`/api/Medicamentos/${id}`);
  },
};
