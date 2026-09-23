import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { BestDates } from '@/components/BestDates';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ParticipantsList } from '@/components/ParticipantsList';
import { renderWithRouter } from '@/test/render';
import type { Trip } from '@/lib/tripStore';

import { LOCALE_STORAGE_KEY } from './detect';
import { setLocale } from './index';

/**
 * The app rendered in another language, end to end through the real components. The
 * rest of the suite runs in English (see src/test/setup.ts), so this is where a string
 * that bypasses `t()` or a date formatted without the locale would show up.
 */

const trip = (participants: Trip['participants']): Trip => ({
  id: 't1',
  name: 'Alps',
  startDate: '2026-09-01',
  endDate: '2026-09-30',
  participants,
});

const german = async () => {
  await act(() => setLocale('de'));
};

describe('rendered in German', () => {
  afterEach(() => localStorage.clear());

  it('translates plurals by count', async () => {
    await german();
    render(
      <ParticipantsList
        participants={[
          { name: 'Ada', availableDates: ['2026-09-02'] },
          { name: 'Bo', availableDates: ['2026-09-02', '2026-09-03'] },
        ]}
      />,
    );

    expect(screen.getByText('1 Tag frei')).toBeInTheDocument();
    expect(screen.getByText('2 Tage frei')).toBeInTheDocument();
  });

  it('starts the week on Monday, with German day names, and still lands each date on its weekday', async () => {
    await german();
    render(
      <AvailabilityCalendar
        startDate="2026-09-01"
        endDate="2026-09-07"
        selectedDates={[]}
        onToggleDate={vi.fn()}
      />,
    );

    const headers = screen.getAllByText(/^(Mo|Di|Mi|Do|Fr|Sa|So)\.?$/).map((el) => el.textContent);
    expect(headers).toEqual(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);

    // 1 September 2026 is a Tuesday: one blank cell before it on a Monday-first grid.
    const tuesday = screen.getByRole('button', { name: 'Dienstag, 1. September 2026' });
    const grid = tuesday.parentElement!;
    expect(Array.from(grid.children).indexOf(tuesday)).toBe(1);
  });

  it('formats dates and ranges the German way', async () => {
    await german();
    render(
      <BestDates
        trip={trip([
          { name: 'Ada', availableDates: ['2026-09-02', '2026-09-03', '2026-09-04'] },
        ])}
      />,
    );

    expect(screen.getByText('Beste Termine')).toBeInTheDocument();
    const row = screen.getAllByTestId('best-date-row')[0];
    expect(within(row).getByTestId('best-date-label')).toHaveTextContent(/2\.\s?–\s?4\. Sept\./);
    expect(within(row).getByText('3 Tage')).toBeInTheDocument();
  });
});

describe('rendered in Polish', () => {
  it('uses all three Polish plural forms, which English-shaped _one/_other cannot express', async () => {
    await act(() => setLocale('pl'));
    render(
      <ParticipantsList
        participants={[
          { name: 'Ola', availableDates: ['2026-09-02'] },
          { name: 'Kuba', availableDates: ['2026-09-02', '2026-09-03'] },
          {
            name: 'Ewa',
            availableDates: ['2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05', '2026-09-06'],
          },
        ]}
      />,
    );

    expect(screen.getByText('1 wolny dzień')).toBeInTheDocument();
    expect(screen.getByText('2 wolne dni')).toBeInTheDocument();
    expect(screen.getByText('5 wolnych dni')).toBeInTheDocument();
  });
});

describe('LanguageSwitcher', () => {
  afterEach(() => localStorage.clear());

  it('switches the page, remembers the choice and updates <html lang>', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <>
        <LanguageSwitcher />
        <ParticipantsList participants={[]} />
      </>,
    );
    expect(screen.getByText('No one has responded yet')).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'nl');

    expect(await screen.findByText('Nog niemand heeft gereageerd')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Taal' })).toHaveValue('nl');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('nl');
    expect(document.documentElement.lang).toBe('nl');
  });

  it('lists every language by its own name', () => {
    renderWithRouter(<LanguageSwitcher />);
    const names = screen.getAllByRole('option').map((o) => o.textContent);
    expect(names).toEqual([
      'English',
      'Deutsch',
      'Español',
      'Français',
      'Nederlands',
      'Polski',
      '日本語',
      '한국어',
    ]);
  });
});
