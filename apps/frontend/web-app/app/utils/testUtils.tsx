import React from 'react';
import { Router } from 'react-router';

import { render, RenderOptions } from '@testing-library/react';

/**
 * Utility function to wrap component in React Router
 * @param ui - component which consist react router elements in render tree
 * @param history - memory History
 * @param options - @testing-library/react render options
 */
export const renderWithRouter = (
  ui: React.ReactElement,
  history: any,
  options?: Omit<RenderOptions, 'queries'>
) => {
  const Wrapper: React.FC<{ children: React.ReactElement }> = ({
    children,
  }) => (
    <Router location={history.location} navigator={history}>
      {children}
    </Router>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};
