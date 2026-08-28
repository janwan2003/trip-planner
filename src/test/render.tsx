import { ReactElement, ReactNode } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Most of this app's screens use react-router's Link, and TripPage reads a route
 * param, so rendering them bare throws. This wraps the tree in a MemoryRouter and lets
 * a test start at a chosen path.
 */
export const renderWithRouter = (
  ui: ReactElement,
  { route = '/', ...options }: RenderOptions & { route?: string } = {},
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...options });
};
