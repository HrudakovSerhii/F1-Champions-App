import React from 'react';

import { Link } from 'react-router-dom';

function RouteInDevelopment({ pageName }: { pageName: string }) {
  return (
    <div className="app-no-route-match container flex flex-col items-center justify-center mx-auto pt-32">
      <h1 className="text-7xl text-center">
        Page "{pageName}" <br /> currently in Development
      </h1>
      <h2 className="text-4xl mt-12 text-center">
        We are working on it to make it available A.S.A.P
        {String.fromCodePoint(0x1f697)}
      </h2>

      <Link to="/" className="text-lg underline pt-12 hover:text-blue-700">
        Drive to the Home page (it is ready!)
      </Link>
    </div>
  );
}

export default RouteInDevelopment;
