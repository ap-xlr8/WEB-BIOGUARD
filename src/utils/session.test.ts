import { beforeEach, describe, expect, it } from 'vitest';
import { clearAccessToken, getAccessToken, setAccessToken } from './session';

describe('sesion de acceso en memoria', () => {
  beforeEach(clearAccessToken);

  it('no persiste el token fuera de la memoria del proceso', () => {
    setAccessToken('access-token');
    expect(getAccessToken()).toBe('access-token');
  });

  it('elimina el token al cerrar la sesion', () => {
    setAccessToken('access-token');
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it('normaliza valores vacios', () => {
    setAccessToken('');
    expect(getAccessToken()).toBeNull();
  });
});
