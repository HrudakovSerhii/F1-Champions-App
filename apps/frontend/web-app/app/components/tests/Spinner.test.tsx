import React from 'react';
import { render } from '@testing-library/react';

import Spinner from '../Spinner';

describe('App Spinner component', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<Spinner title="Loading" />);

    expect(asFragment()).toMatchSnapshot();
  });
});
