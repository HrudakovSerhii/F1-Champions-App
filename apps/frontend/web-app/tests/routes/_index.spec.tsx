import { createMemoryRouter, RouterProvider } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';

import App from '../../app/app';

test('renders loader data', async () => {
  const memoryRouter = createMemoryRouter([
    {
      path: '/',
      Component: App,
    },
  ]);

  render(<RouterProvider router={memoryRouter} />);

  await waitFor(() => screen.findByText('Hello there,'));
});
