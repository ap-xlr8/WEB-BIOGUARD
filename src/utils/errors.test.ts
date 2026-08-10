import { describe, expect, it } from 'vitest';
import { getErrorMessage, getErrorStatus } from './errors';

describe('normalizacion de errores', () => {
  it('usa mensajes de Error sin exponer estructuras arbitrarias', () => {
    expect(getErrorMessage(new Error('fallo controlado'), 'fallback')).toBe('fallo controlado');
    expect(getErrorMessage(new Error(''), 'fallback')).toBe('fallback');
  });

  it('usa el fallback ante valores desconocidos', () => {
    expect(getErrorMessage({ unexpected: true }, 'fallback')).toBe('fallback');
    expect(getErrorMessage({ message: 42 }, 'fallback')).toBe('fallback');
    expect(getErrorMessage(null, 'fallback')).toBe('fallback');
  });

  it('prioriza el mensaje seguro enviado por la API', () => {
    const error = {
      isAxiosError: true,
      message: 'network',
      response: { data: { message: 'solicitud rechazada' }, status: 422 },
    };
    expect(getErrorMessage(error, 'fallback')).toBe('solicitud rechazada');
    expect(getErrorStatus(error)).toBe(422);
  });

  it('acepta errores ya normalizados', () => {
    expect(getErrorMessage({ message: 'normalizado' }, 'fallback')).toBe('normalizado');
  });

  it('extrae un estado normalizado', () => {
    expect(getErrorStatus({ status: 403 })).toBe(403);
    expect(getErrorStatus({ status: '403' })).toBeUndefined();
    expect(getErrorStatus(null)).toBeUndefined();
  });
});
