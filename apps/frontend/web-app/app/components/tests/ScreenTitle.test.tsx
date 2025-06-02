import { render } from '@testing-library/react';

import ScreenTitle from '../ScreenTitle';

describe('App ScreenTitle component', () => {
  it('should render correctly', () => {
    const { asFragment } = render(<ScreenTitle title="Clean title" />);

    expect(asFragment()).toMatchSnapshot();
  });
});
