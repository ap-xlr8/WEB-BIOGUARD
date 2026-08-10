import { describe, expect, it } from 'vitest';
import type { AuthResponse, EffectiveAccessResponse } from '../types';
import {
  APP_PERMISSIONS,
  createRestrictedAccess,
  hasAnyPermission,
  hasPermission,
  normalizeRole,
} from './authorization';

const user = (rol: string): AuthResponse => ({
  token: '',
  userId: 'user-1',
  nombre: 'Test',
  rol,
  plan: 'BioGuard Family',
});

describe('authorization policy', () => {
  it('normalizes only exact supported roles', () => {
    expect(normalizeRole(' DUEÑO '.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))).toBe('dueno');
    expect(normalizeRole('administrador_global')).toBe('unknown');
    expect(normalizeRole('superdueno')).toBe('unknown');
    expect(normalizeRole(undefined)).toBe('unknown');
  });

  it('fails closed when effective access cannot be loaded', () => {
    const fallback = createRestrictedAccess(user('dueno'));

    expect(fallback.permisos).toEqual([
      APP_PERMISSIONS.ACCOUNT_PROFILE,
      APP_PERMISSIONS.ACCOUNT_SESSIONS,
    ]);
    expect(hasPermission(fallback, APP_PERMISSIONS.BILLING_MANAGE)).toBe(false);
    expect(hasPermission(fallback, APP_PERMISSIONS.REPORT_EXPORT)).toBe(false);
    expect(fallback.plan).toBeNull();
  });

  it('does not grant any permission to an unknown role', () => {
    expect(createRestrictedAccess(user('owner')).permisos).toEqual([]);
  });

  it('uses the permissions returned by the backend', () => {
    const access: EffectiveAccessResponse = {
      rol: 'cuidador',
      pacienteId: 'patient-1',
      nivelAccesoCuidador: 'resumen_semanal',
      cuidadorDentroDelPlan: true,
      plan: null,
      permisos: [APP_PERMISSIONS.ALERT_READ, APP_PERMISSIONS.HEALTH_SUMMARY],
    };

    expect(hasPermission(access, APP_PERMISSIONS.HEALTH_SUMMARY)).toBe(true);
    expect(hasPermission(access, APP_PERMISSIONS.HEALTH_HISTORY)).toBe(false);
    expect(hasAnyPermission(access, [APP_PERMISSIONS.HEALTH_HISTORY, APP_PERMISSIONS.ALERT_READ])).toBe(true);
  });
});
