import { Outlet, useParams } from 'react-router';

import Header from './components/Header';

import './App.css';

function App() {
  const routerParams = useParams();

  return (
    <div className="App">
      <Header />
      <Outlet context={routerParams} />
    </div>
  );
}

export default App;
