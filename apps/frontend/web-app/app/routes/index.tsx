import React, { Suspense } from 'react';

import { createBrowserRouter } from 'react-router-dom';
import { createRoutesFromElements, Route } from 'react-router';

import App from '../App';

import HomeScreen from '../screens/homeScreen';

import ErrorBoundary from './ErrorBoundary';
import NoRouteMatch from './NoRouteMatch';
import RouteLoadingError from './RouteLoadingError';
import RouteInDevelopment from './RouteInDevelopment';

import Spinner from '../components/Spinner';

import { ABOUT, CONTACT, HOME, SEASON, SEASONS } from '../constants';

const SeasonScreen = React.lazy(() => import('../screens/seasonScreen'));

const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path={HOME} element={<App />}>
        <Route index element={<HomeScreen />} />
        <Route
          path={SEASON}
          element={
            <ErrorBoundary fallback={<RouteLoadingError />}>
              <Suspense
                children={<SeasonScreen />}
                fallback={<Spinner title="Loading..." />}
              />
            </ErrorBoundary>
          }
        />
        <Route
          path={SEASONS}
          element={<RouteInDevelopment pageName={SEASONS} />}
        />
        <Route
          path={CONTACT}
          element={<RouteInDevelopment pageName={CONTACT} />}
        />
        <Route path={ABOUT} element={<RouteInDevelopment pageName={ABOUT} />} />
        <Route path="*" element={<NoRouteMatch />} />
      </Route>
    </Route>
  )
);

export default appRouter;
