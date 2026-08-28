import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/render';
import { Tutorial } from './Tutorial';
import { ModernDateInput } from './ModernDateInput';
import { NavLink } from './NavLink';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

describe('Tutorial', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows the four steps by default', () => {
    render(<Tutorial />);

    expect(screen.getByText(/Create a Trip/i)).toBeInTheDocument();
    expect(screen.getByText(/Share the Link/i)).toBeInTheDocument();
    expect(screen.getByText(/Mark and Save Availability/i)).toBeInTheDocument();
    expect(screen.getByText(/Pick Best Dates/i)).toBeInTheDocument();
  });

  it('remembers that it was hidden', async () => {
    const user = userEvent.setup();
    render(<Tutorial />);

    await user.click(screen.getByRole('button', { name: /hide tutorial/i }));

    expect(screen.getByRole('button', { name: /show tutorial/i })).toBeInTheDocument();
    expect(localStorage.getItem('tutorialHidden')).toBe('true');
  });

  it('starts hidden when it was hidden before', () => {
    localStorage.setItem('tutorialHidden', 'true');
    render(<Tutorial />);

    expect(screen.getByRole('button', { name: /show tutorial/i })).toBeInTheDocument();
  });

  it('forgets the preference when shown again', async () => {
    const user = userEvent.setup();
    localStorage.setItem('tutorialHidden', 'true');
    render(<Tutorial />);

    await user.click(screen.getByRole('button', { name: /show tutorial/i }));

    expect(localStorage.getItem('tutorialHidden')).toBeNull();
    expect(screen.getByText(/Create a Trip/i)).toBeInTheDocument();
  });

  it('marks completed steps', () => {
    const { container } = render(<Tutorial completedSteps={[1, 2]} />);
    // Completed steps swap their number for a check icon.
    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
  });
});

describe('ModernDateInput', () => {
  it('shows the placeholder until a date is chosen', () => {
    render(<ModernDateInput label="Start Date" onChange={vi.fn()} />);

    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('Select date')).toBeInTheDocument();
  });

  it('formats a supplied value for reading, not as an ISO string', () => {
    render(<ModernDateInput label="Start Date" value="2026-09-03" onChange={vi.fn()} />);

    expect(screen.getByText('03/09/2026')).toBeInTheDocument();
    expect(screen.queryByText('2026-09-03')).not.toBeInTheDocument();
  });

  it('reports the chosen date as YYYY-MM-DD', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ModernDateInput label="Start Date" value="2026-09-03" onChange={onChange} />);

    await user.click(screen.getByRole('button'));

    const day = await screen.findByText('15');
    await user.click(day);

    expect(onChange).toHaveBeenCalledWith('2026-09-15');
  });

  it('cannot be opened when disabled', async () => {
    const user = userEvent.setup();
    render(<ModernDateInput label="Start Date" onChange={vi.fn()} disabled />);

    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});


describe('NavLink', () => {
  it('renders a link to its target', () => {
    renderWithRouter(<NavLink to="/about">About</NavLink>);
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  });

  it('applies the active class on the current route', () => {
    renderWithRouter(
      <NavLink to="/about" className="base" activeClassName="is-active">
        About
      </NavLink>,
      { route: '/about' },
    );

    expect(screen.getByRole('link', { name: 'About' })).toHaveClass('base', 'is-active');
  });

  it('leaves the active class off other routes', () => {
    renderWithRouter(
      <NavLink to="/about" className="base" activeClassName="is-active">
        About
      </NavLink>,
      { route: '/' },
    );

    expect(screen.getByRole('link', { name: 'About' })).not.toHaveClass('is-active');
  });
});
