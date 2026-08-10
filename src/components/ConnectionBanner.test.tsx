import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConnectionBanner } from './ConnectionBanner';

const setOnline = (value: boolean) => Object.defineProperty(navigator, 'onLine', { configurable: true, value });

describe('ConnectionBanner', () => {
  beforeEach(() => setOnline(true));

  it('permanece oculto mientras existe conectividad', () => {
    render(<ConnectionBanner />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('informa la pérdida y recuperación de conectividad', () => {
    render(<ConnectionBanner />);
    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status')).toHaveTextContent('Sin conexión');

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
