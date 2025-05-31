import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { createMemoryHistory } from 'history';

import Header from '../Header';

import { renderWithRouter } from '../../utils/testUtils';

import { HOME, SEASONS } from '../../constants';

describe('Header', () => {
  it('clicking Home link navigates to Home page', () => {
    const history = createMemoryHistory();

    renderWithRouter(<Header />, history);

    fireEvent.click(screen.getByText('Home'));

    expect(history.location.pathname).toBe(HOME);
  });

  it('clicking SEASONS link navigates to SEASONS page', async () => {
    const history = createMemoryHistory();

    renderWithRouter(<Header />, history);

    fireEvent.click(screen.getByText('Seasons'));

    expect(history.location.pathname).toBe(SEASONS);
  });

  it('should render correctly', () => {
    const history = createMemoryHistory();

    const { asFragment } = renderWithRouter(<Header />, history);

    expect(asFragment()).toMatchSnapshot();
  });
});
