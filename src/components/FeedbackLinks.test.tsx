import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/render';
import { FeedbackLinks } from './FeedbackLinks';

const okResponse = () =>
  new Response(JSON.stringify({ id: 'x' }), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  });

describe('FeedbackLinks', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('shows both links and no form until one is clicked', () => {
    renderWithRouter(<FeedbackLinks />);

    expect(screen.getByRole('button', { name: /report a bug/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /suggest a feature/i })).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('opens a personal note and sends a bug report with the page it came from', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderWithRouter(<FeedbackLinks />);

    await user.click(screen.getByRole('button', { name: /report a bug/i }));
    expect(screen.getByText(/I'm Janek/)).toBeInTheDocument();

    const send = screen.getByRole('button', { name: /^send$/i });
    expect(send).toBeDisabled();

    await user.type(screen.getByRole('textbox', { name: /report a bug/i }), '  Calendar froze  ');
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'a@b.co');
    await user.click(send);

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/thank you/i));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/feedback');
    expect(JSON.parse(init.body)).toEqual({
      kind: 'bug',
      message: 'Calendar froze',
      contact: 'a@b.co',
      page: '/',
    });
  });

  it('sends a feature request without an email', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderWithRouter(<FeedbackLinks />);

    await user.click(screen.getByRole('button', { name: /suggest a feature/i }));
    expect(screen.getByText(/read every request carefully/i)).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: /suggest a feature/i }), 'Dark mode');
    await user.click(screen.getByRole('button', { name: /^send$/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      kind: 'feature',
      message: 'Dark mode',
      page: '/',
    });
  });

  it('keeps the draft and says why when sending fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'message must be 1-2000 characters.' }), { status: 400 }),
      ),
    );
    const user = userEvent.setup();
    renderWithRouter(<FeedbackLinks />);

    await user.click(screen.getByRole('button', { name: /report a bug/i }));
    const box = screen.getByRole('textbox', { name: /report a bug/i });
    await user.type(box, 'Broken');
    await user.click(screen.getByRole('button', { name: /^send$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't send that/i);
    expect(box).toHaveValue('Broken');
  });

  it('reports a network failure rather than pretending it sent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    const user = userEvent.setup();
    renderWithRouter(<FeedbackLinks />);

    await user.click(screen.getByRole('button', { name: /suggest a feature/i }));
    await user.type(screen.getByRole('textbox', { name: /suggest a feature/i }), 'Idea');
    await user.click(screen.getByRole('button', { name: /^send$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't send that/i);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('starts a fresh form after a sent one is closed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse()));
    const user = userEvent.setup();
    renderWithRouter(<FeedbackLinks />);

    const trigger = screen.getByRole('button', { name: /report a bug/i });
    await user.click(trigger);
    await user.type(screen.getByRole('textbox', { name: /report a bug/i }), 'Bug');
    await user.click(screen.getByRole('button', { name: /^send$/i }));
    await screen.findByRole('status');

    await user.keyboard('{Escape}');
    await user.click(trigger);
    expect(screen.getByRole('textbox', { name: /report a bug/i })).toHaveValue('');
  });
});
