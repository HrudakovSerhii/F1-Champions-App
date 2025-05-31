import React from 'react';

import { Link } from 'react-router-dom';

import { CONTACT_EMAIL } from '../constants';

function RouteLoadingError() {
  const contactUrl = `mailto:${CONTACT_EMAIL}`;

  return (
    <div className="app-no-route-match container flex flex-col justify-center h-[70vh]">
      <div>
        <h1 className="text-9xl">Oops</h1>
        <h2 className="text-4xl mt-12">
          Something went wrong while loading of the page :( Please try to
          refresh the page or contact <Link to={contactUrl}>us</Link> for
          assistance
        </h2>
      </div>
      <Link to="/" className="text-lg underline pt-12 hover:text-blue-700">
        Go to the home page
      </Link>
    </div>
  );
}

export default RouteLoadingError;
