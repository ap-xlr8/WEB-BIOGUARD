import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('asocia la etiqueta y el mensaje de error con el control', () => {
    render(<Input label="Correo" error="Correo inválido" />);
    const input = screen.getByLabelText('Correo');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Correo inválido');
  });

  it('permite mostrar y ocultar una contraseña con teclado', () => {
    render(<Input label="Contraseña" type="password" />);
    const input = screen.getByLabelText('Contraseña');
    const toggle = screen.getByRole('button', { name: 'Mostrar contraseña' });

    fireEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(toggle).toHaveAccessibleName('Ocultar contraseña');
  });
});
