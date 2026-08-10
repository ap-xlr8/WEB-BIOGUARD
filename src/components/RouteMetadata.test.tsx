import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RouteMetadata } from './RouteMetadata';

describe('RouteMetadata', () => {
  it('actualiza título y descripción para una ruta conocida', async () => {
    render(<MemoryRouter initialEntries={['/salud']}><RouteMetadata /></MemoryRouter>);

    await waitFor(() => expect(document.title).toBe('Análisis y reportes | BioGuard'));
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', expect.stringContaining('Histórico'));
  });

  it('usa metadatos seguros de respaldo para rutas desconocidas', async () => {
    render(<MemoryRouter initialEntries={['/ruta-inexistente']}><RouteMetadata /></MemoryRouter>);

    await waitFor(() => expect(document.title).toBe('BioGuard'));
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Plataforma de monitoreo preventivo conectado.');
  });
});
