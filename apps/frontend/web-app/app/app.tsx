import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import Home from './routes/Home';

import { Layout } from './root';

const About = lazy(() => import('./routes/about'));

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home title="f1-web-app" />} />
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
