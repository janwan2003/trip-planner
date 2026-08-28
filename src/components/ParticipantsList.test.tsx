import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { ParticipantsList } from './ParticipantsList';

const people = [
  { name: 'Ada', availableDates: ['2026-09-01', '2026-09-02'] },
  { name: 'Bo', availableDates: [] },
];

describe('ParticipantsList', () => {
  it('invites the first response when nobody has answered', () => {
    render(<ParticipantsList participants={[]} />);

    expect(screen.getByText(/No one has responded yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Be the first to mark your availability/i)).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('lists everyone who has responded', () => {
    render(<ParticipantsList participants={people} />);

    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('Bo')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('says how many days each person offered, in the singular and the plural', () => {
    render(<ParticipantsList participants={people} />);

    expect(screen.getByText(/2 days available/i)).toBeInTheDocument();
    expect(screen.getByText(/0 days available/i)).toBeInTheDocument();
  });

  it('reports one day without pluralising it', () => {
    render(<ParticipantsList participants={[{ name: 'Ada', availableDates: ['2026-09-01'] }]} />);
    expect(screen.getByText(/1 day available/i)).toBeInTheDocument();
  });

  it('reports the toggled name back to the caller', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    render(<ParticipantsList participants={people} onToggleParticipant={onToggle} />);

    await user.click(screen.getByText('Ada'));

    expect(onToggle).toHaveBeenCalledWith('Ada');
  });

  it('does not blow up when clicked with no handler attached', async () => {
    const user = userEvent.setup();
    render(<ParticipantsList participants={people} />);

    await expect(user.click(screen.getByText('Ada'))).resolves.not.toThrow();
  });

  it('recognises the current user regardless of the case they typed', () => {
    // The app treats "ada" and "Ada" as one person everywhere else, including the
    // database's unique index, so this list has to agree.
    const plain = render(<ParticipantsList participants={people} />);
    const withoutMarker = plain.container.querySelectorAll('svg').length;
    plain.unmount();

    const marked = render(<ParticipantsList participants={people} currentUser="ADA" />);
    expect(marked.container.querySelectorAll('svg').length).toBe(withoutMarker + 1);
  });

  it('marks a selected participant', () => {
    const { container } = render(
      <ParticipantsList participants={people} selectedParticipants={['Ada']} />,
    );

    // Selection draws a filled circle with a check inside it.
    expect(container.querySelectorAll('svg').length).toBe(1);
  });
});
