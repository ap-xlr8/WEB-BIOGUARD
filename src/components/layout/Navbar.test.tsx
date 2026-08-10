import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { Navbar } from './Navbar';

vi.mock('../../context', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
  useAuth: () => ({ isAuthenticated: false }),
}));

describe('Navbar', () => {
  it('expone navegación principal y menú móvil operable', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/']}><Navbar /></MemoryRouter>);

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getByRole('navigation', { name: 'Navegación móvil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('no presenta violaciones estructurales detectables por axe', async () => {
    const { container } = render(<MemoryRouter><Navbar /></MemoryRouter>);
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
