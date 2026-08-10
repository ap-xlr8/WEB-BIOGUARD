import type { AuthResponse, EffectiveAccessResponse } from '../types';

export const APP_PERMISSIONS = {
  ADMIN_PANEL: 'admin.panel',
  ACCOUNT_PROFILE: 'account.profile',
  ACCOUNT_SESSIONS: 'account.sessions',
  PATIENT_CREATE: 'patient.create',
  PATIENT_READ: 'patient.read',
  PATIENT_MANAGE: 'patient.manage',
  ALERT_READ: 'alert.read',
  ALERT_ACKNOWLEDGE: 'alert.acknowledge',
  HEALTH_SUMMARY: 'health.summary',
  HEALTH_HISTORY: 'health.history',
  REPORT_EXPORT: 'report.export',
  MEDICATION_READ: 'medication.read',
  MEDICATION_TAKE: 'medication.take',
  MEDICATION_MANAGE: 'medication.manage',
  CAREGIVER_MANAGE: 'caregiver.manage',
  BILLING_MANAGE: 'billing.manage',
  DEVICE_READ: 'device.read',
  DEVICE_PAIR: 'device.pair',
  GPS_CONTINUOUS: 'gps.continuous',
  NIGHT_GUARDIAN: 'guardian.night',
  AI_CONSOLE: 'ai.console',
} as const;

export type AppPermission = typeof APP_PERMISSIONS[keyof typeof APP_PERMISSIONS];
export type AppRole = 'dueno' | 'paciente' | 'cuidador' | 'administrador' | 'unknown';

export function normalizeRole(role?: string | null): AppRole {
  const normalized = role?.trim().toLowerCase();
  if (normalized === 'dueno' || normalized === 'paciente' || normalized === 'cuidador' || normalized === 'administrador') {
    return normalized;
  }
  return 'unknown';
}

export function hasPermission(access: EffectiveAccessResponse | null, permission: AppPermission): boolean {
  return access?.permisos.includes(permission) === true;
}

export function hasAnyPermission(
  access: EffectiveAccessResponse | null,
  permissions: readonly AppPermission[],
): boolean {
  return permissions.some((permission) => hasPermission(access, permission));
}

// This fallback contains no package entitlement. The API remains authoritative.
export function createRestrictedAccess(user: AuthResponse): EffectiveAccessResponse {
  const rol = normalizeRole(user.rol);
  const permisos: AppPermission[] = [];

  if (rol === 'administrador') {
    permisos.push(APP_PERMISSIONS.ADMIN_PANEL, APP_PERMISSIONS.ACCOUNT_PROFILE, APP_PERMISSIONS.ACCOUNT_SESSIONS);
  } else if (rol !== 'unknown') {
    permisos.push(APP_PERMISSIONS.ACCOUNT_PROFILE, APP_PERMISSIONS.ACCOUNT_SESSIONS);
  }

  return {
    rol,
    pacienteId: null,
    nivelAccesoCuidador: null,
    cuidadorDentroDelPlan: false,
    plan: null,
    permisos,
  };
}
