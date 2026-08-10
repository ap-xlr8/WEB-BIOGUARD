import httpClient from '../utils/httpClient';
import type { AxiosRequestConfig } from 'axios';
import {
  UsuarioPerfilResponse,
  UpdatePerfilRequest,
  CambiarCorreoRequest,
  CambiarPlanRequest,
  PlanResponse,
  EffectiveAccessResponse,
  MessageResponse,
} from '../types';

export const usuarioService = {
  miPerfil: async (config?: AxiosRequestConfig): Promise<UsuarioPerfilResponse> => {
    const { data } = await httpClient.get<UsuarioPerfilResponse>('/api/UsuariosWeb/mi-perfil', config);
    return data;
  },

  editarPerfil: async (dto: UpdatePerfilRequest): Promise<MessageResponse> => {
    const { data } = await httpClient.put<MessageResponse>('/api/UsuariosWeb/mi-perfil', dto);
    return data;
  },

  cambiarCorreo: async (dto: CambiarCorreoRequest): Promise<MessageResponse> => {
    const { data } = await httpClient.put<MessageResponse>('/api/UsuariosWeb/mi-perfil/correo', dto);
    return data;
  },

  miPlan: async (): Promise<PlanResponse> => {
    const { data } = await httpClient.get<PlanResponse>('/api/UsuariosWeb/mi-plan');
    return data;
  },

  miAcceso: async (): Promise<EffectiveAccessResponse> => {
    const { data } = await httpClient.get<EffectiveAccessResponse>('/api/UsuariosWeb/mi-acceso');
    return data;
  },

  cambiarPlan: async (dto: CambiarPlanRequest): Promise<MessageResponse> => {
    const { data } = await httpClient.put<MessageResponse>('/api/UsuariosWeb/cambiar-plan', dto);
    return data;
  },

  eliminarCuenta: async (): Promise<void> => {
    await httpClient.delete('/api/UsuariosWeb/mi-cuenta');
  },

  subirFoto: async (fotoBase64: string): Promise<MessageResponse> => {
    const { data } = await httpClient.put<MessageResponse>('/api/UsuariosWeb/mi-perfil/foto', { fotoBase64 });
    return data;
  },
};
