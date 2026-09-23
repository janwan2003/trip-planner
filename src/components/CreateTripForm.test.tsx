import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTripForm } from './CreateTripForm';
import { getRecentTrips, rememberTrip } from '@/lib/recentTrips';

const navigate = vi.fn();
let searchParams = new URLSearchParams();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
  useSearchParams: () => [searchParams],
}));

const saveTrip = vi.fn();
vi.mock('@/lib/tripStore', async () => {
  const actual = await vi.importActual<typeof import('@/lib/tripStore')>('@/lib/tripStore');
  return { ...actual, saveTrip: (...args: unknown[]) => saveTrip(...args) };
});

/**
 * The real date input is a popover calendar. Driving two of those through synthetic
 * events is unreliable and, more to the point, is not what these tests are about: the
 * subject here is the form's validation and submit behaviour. The widget has its own
 * tests in formAndTutorial.test.tsx.
 */
vi.mock('@/components/ModernDateInput', () => ({
  ModernDateInput: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value?: string;
    onChange: (v: string) => void;
  }) => (
    <input
      aria-label={label}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const fill = (name: string, start: string, end: string) => {
  fireEvent.change(screen.getByPlaceholderText(/summer adventure/i), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: start } });
  fireEvent.change(screen.getByLabelText('End Date'), { target: { value: end } });
};

describe('CreateTripForm', () => {
  beforeEach(() => {
    navigate.mockClear();
    saveTrip.mockReset();
    saveTrip.mockResolvedValue(undefined);
    localStorage.clear();
    searchParams = new URLSearchParams();
  });

  /**
   * The origin is the only way to tell whether invited people go on to create trips:
   * nearly every arrival is an invitation link, and D1 stored nothing about how a trip
   * began until this field.
   */
  describe('origin', () => {
    const submit = async () => {
      const user = userEvent.setup();
      render(<CreateTripForm />);
      fill('Alps', '2026-09-01', '2026-09-03');
      await user.click(screen.getByRole('button', { name: /create trip/i }));
      await waitFor(() => expect(saveTrip).toHaveBeenCalledTimes(1));
      return saveTrip.mock.calls[0][1];
    };

    it('is trip-page when the visitor followed "Start your own trip"', async () => {
      searchParams = new URLSearchParams('from=trip');
      // Takes precedence: someone following that link has opened a trip by definition.
      rememberTrip({ id: 'theirs', name: 'T', startDate: '2026-09-01', endDate: '2026-09-02' });
      expect(await submit()).toBe('trip-page');
    });

    it('is invitee when this browser has opened someone else\'s trip before', async () => {
      rememberTrip({ id: 'theirs', name: 'T', startDate: '2026-09-01', endDate: '2026-09-02' });
      expect(await submit()).toBe('invitee');
    });

    it('is direct for a browser that has only ever opened its own trips', async () => {
      rememberTrip({ id: 'mine', name: 'M', startDate: '2026-09-01', endDate: '2026-09-02' }, 'creator');
      expect(await submit()).toBe('direct');
    });

    it('is direct for a first visit, and ignores an unrelated query string', async () => {
      searchParams = new URLSearchParams('from=newsletter');
      expect(await submit()).toBe('direct');
    });
  });

  it('gives the only call to action a 48px target and its own sizing', () => {
    // The hero variant used to bake padding into the variant, where the default size's
    // h-10 won the twMerge conflict and left this button 40px tall - shorter than the
    // 44px inputs above it. jsdom has no layout, so this asserts the class that carries
    // the height; the measured 48px is recorded in the commit.
    render(<CreateTripForm />);

    const cta = screen.getByRole('button', { name: /create trip/i });
    expect(cta.className).toContain('h-12');
    expect(cta.className).not.toContain('h-10');
  });

  it('will not submit without a name', async () => {
    const user = userEvent.setup();
    render(<CreateTripForm />);

    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-09-01' } });
    fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-09-05' } });
    await user.click(screen.getByRole('button', { name: /create trip/i }));

    expect(saveTrip).not.toHaveBeenCalled();
  });

  it('will not submit without both dates', async () => {
    const user = userEvent.setup();
    render(<CreateTripForm />);

    fireEvent.change(screen.getByPlaceholderText(/summer adventure/i), {
      target: { value: 'Alps' },
    });
    fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-09-01' } });
    await user.click(screen.getByRole('button', { name: /create trip/i }));

    expect(saveTrip).not.toHaveBeenCalled();
  });

  it('refuses a range that ends before it starts', async () => {
    const user = userEvent.setup();
    render(<CreateTripForm />);

    fill('Alps', '2026-09-10', '2026-09-01');
    await user.click(screen.getByRole('button', { name: /create trip/i }));

    await waitFor(() => expect(saveTrip).not.toHaveBeenCalled());
    expect(navigate).not.toHaveBeenCalled();
  });

  it('refuses a trip longer than 366 days, and accepts exactly 366', async () => {
    const user = userEvent.setup();
    render(<CreateTripForm />);

    fill('Year out', '2028-01-01', '2029-01-01');
    await user.click(screen.getByRole('button', { name: /create trip/i }));
    await waitFor(() => expect(saveTrip).not.toHaveBeenCalled());

    fill('Year out', '2028-01-01', '2028-12-31');
    await user.click(screen.getByRole('button', { name: /create trip/i }));
    await waitFor(() => expect(saveTrip).toHaveBeenCalledTimes(1));
  });

  it('treats a name of only spaces as no name, and trims a real one', async () => {
    const user = userEvent.setup();
    render(<CreateTripForm />);

    fill('   ', '2026-09-01', '2026-09-03');
    await user.click(screen.getByRole('button', { name: /create trip/i }));
    await waitFor(() => expect(saveTrip).not.toHaveBeenCalled());

    fill('  Alps  ', '2026-09-01', '2026-09-03');
    await user.click(screen.getByRole('button', { name: /create trip/i }));
    await waitFor(() => expect(saveTrip).toHaveBeenCalledTimes(1));
    expect(saveTrip.mock.calls[0][0].name).toBe('Alps');
  });

  it('accepts a single-day trip', async () => {
    const user = userEvent.setup();
    render(<CreateTripForm />);

    fill('Day out', '2026-09-01', '2026-09-01');
    await user.click(screen.getByRole('button', { name: /create trip/i }));

    await waitFor(() => expect(saveTrip).toHaveBeenCalledTimes(1));
  });

  it('saves the trip with an unguessable id and navigates to it', async () => {
    const user = userEvent.setup();
    render(<CreateTripForm />);

    fill('Alps', '2026-09-01', '2026-09-05');
    await user.click(screen.getByRole('button', { name: /create trip/i }));

    await waitFor(() => expect(saveTrip).toHaveBeenCalledTimes(1));

    const saved = saveTrip.mock.calls[0][0];
    expect(saved).toMatchObject({
      name: 'Alps',
      startDate: '2026-09-01',
      endDate: '2026-09-05',
      participants: [],
    });
    // 16 bytes of CSPRNG output as hex - the trip link is the only credential.
    expect(saved.id).toMatch(/^[0-9a-f]{32}$/);

    await waitFor(() => expect(navigate).toHaveBeenCalledWith(`/trip/${saved.id}`));
  });

  it('does not navigate when saving fails, and leaves the form usable', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    saveTrip.mockRejectedValue(new Error('offline'));
    const user = userEvent.setup();
    render(<CreateTripForm />);

    fill('Alps', '2026-09-01', '2026-09-05');
    await user.click(screen.getByRole('button', { name: /create trip/i }));

    await waitFor(() => expect(saveTrip).toHaveBeenCalled());
    expect(navigate).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole('button', { name: /create trip/i })).toBeEnabled());

    errorSpy.mockRestore();
  });

  it('records the trip in this browser, so a creator who loses the link can return', async () => {
    const user = userEvent.setup();
    render(<CreateTripForm />);

    fill('Alps trip', '2026-09-01', '2026-09-05');
    await user.click(screen.getByRole('button', { name: /create trip/i }));

    await waitFor(() => expect(navigate).toHaveBeenCalled());

    const remembered = getRecentTrips();
    expect(remembered).toHaveLength(1);
    expect(remembered[0].name).toBe('Alps trip');
    expect(remembered[0].role).toBe('creator');
    expect(navigate).toHaveBeenCalledWith(`/trip/${remembered[0].id}`);
  });

  it('does not record a trip the backend refused, which would list a dead link', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    saveTrip.mockRejectedValue(new Error('down'));
    const user = userEvent.setup();
    render(<CreateTripForm />);

    fill('Alps trip', '2026-09-01', '2026-09-05');
    await user.click(screen.getByRole('button', { name: /create trip/i }));

    await waitFor(() => expect(saveTrip).toHaveBeenCalled());
    expect(getRecentTrips()).toEqual([]);

    errorSpy.mockRestore();
  });
});
