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

  it('still renders, and still hides, when the browser blocks site data', async () => {
    // Chrome's "block all site data" throws from the storage calls themselves. This
    // component used to call them unguarded, which blanked the whole trip page.
    const blocked = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    const user = userEvent.setup();

    render(<Tutorial />);
    expect(screen.getByText(/Create a Trip/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /hide tutorial/i }));
    expect(screen.getByRole('button', { name: /show tutorial/i })).toBeInTheDocument();

    get.mockRestore();
    set.mockRestore();
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

    // en-US in jsdom, so month first; the order follows the reader's locale.
    expect(screen.getByText('09/03/2026')).toBeInTheDocument();
    expect(screen.queryByText('2026-09-03')).not.toBeInTheDocument();
  });

  it('follows the value when the parent clears it', () => {
    const { rerender } = render(
      <ModernDateInput label="Start Date" value="2026-09-03" onChange={vi.fn()} />,
    );
    rerender(<ModernDateInput label="Start Date" value="" onChange={vi.fn()} />);

    expect(screen.getByText('Select date')).toBeInTheDocument();
    expect(screen.queryByText('03/09/2026')).not.toBeInTheDocument();
  });

  it('reports the chosen date as YYYY-MM-DD', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    // A year far ahead: days before today are disabled, so a fixed 2026 date turned
    // this test red the day the calendar passed it.
    render(<ModernDateInput label="Start Date" value="2099-09-03" onChange={onChange} />);

    await user.click(screen.getByRole('button'));

    // The calendar is a lazy chunk; its first import under vitest includes a cold
    // transform, which can outlast findBy's 1s default.
    const day = await screen.findByText('15', {}, { timeout: 5000 });
    await user.click(day);

    expect(onChange).toHaveBeenCalledWith('2099-09-15');
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
