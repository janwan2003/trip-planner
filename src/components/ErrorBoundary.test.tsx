import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

const Boom = (): never => {
  throw new Error('boom');
};

describe('ErrorBoundary', () => {
  it('renders its children untouched while nothing fails', () => {
    const { container } = render(
      <ErrorBoundary>
        <p>fine</p>
      </ErrorBoundary>,
    );
    // No wrapper element: the prerendered markup must match the hydrated tree.
    expect(container.innerHTML).toBe('<p>fine</p>');
  });

  it('replaces a crashed tree with a way forward instead of a blank page', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
    errorSpy.mockRestore();
  });
});
