import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Button from '../../src/components/ui/Button';

describe('Button Component', () => {
  it('renderiza botón con texto', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('aplica variante primary por defecto', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button', { name: /primary/i });
    expect(button).toHaveClass('btn-primary');
  });

  it('aplica variante secondary', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: /secondary/i });
    expect(button).toHaveClass('btn-secondary');
  });

  it('aplica variante danger', () => {
    render(<Button variant="danger">Eliminar</Button>);
    const button = screen.getByRole('button', { name: /eliminar/i });
    expect(button).toHaveClass('btn-danger');
  });

  it('deshabilita botón cuando disabled es true', () => {
    render(<Button disabled>Deshabilitado</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('maneja eventos de click', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('muestra focus ring visible al navegar por teclado', async () => {
    const user = userEvent.setup();
    render(<Button>Focus</Button>);
    const button = screen.getByRole('button');

    await user.tab();
    expect(button).toHaveFocus();
  });
});
