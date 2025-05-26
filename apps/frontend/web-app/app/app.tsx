import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import NxWelcome from './nx-welcome';

import { Layout } from './root';

const About = lazy(() => import('./routes/about'));

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<NxWelcome title="f1-spa" />} />
        <Route
          path="/about"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <About />
            </Suspense>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
