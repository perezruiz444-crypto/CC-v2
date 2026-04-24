import { render } from '@testing-library/react';
import Card from '../../src/components/ui/Card';

describe('Card Component', () => {
  it('renderiza card con children', () => {
    const { getByText } = render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );
    
    expect(getByText('Card Title')).toBeInTheDocument();
    expect(getByText('Card content')).toBeInTheDocument();
  });

  it('aplica clase glass-effect', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glass-effect');
  });

  it('renderiza con padding por defecto (md)', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-4');
  });

  it('aplica padding sm', () => {
    const { container } = render(<Card padding="sm">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-2');
  });

  it('aplica padding lg', () => {
    const { container } = render(<Card padding="lg">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-6');
  });

  it('aplica clase card-interactive cuando interactive=true (default)', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('card-interactive');
  });

  it('no aplica card-interactive cuando interactive=false', () => {
    const { container } = render(<Card interactive={false}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('card-interactive');
  });

  it('aplica className personalizado', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });
});
