import React from 'react';
import { Link } from 'react-router-dom';

import { ABOUT, CONTACT, HOME, SEASONS, SEASONS_RANGE } from '../constants';

const Header = () => {
  return (
    <header className="app-header">
      <nav className="border-b-2 border-gray-300">
        <div className="flex flex-wrap items-center justify-between p-4">
          <a href="https://www.formula1.com/" className="flex items-center">
            <img
              src="/assets/f1-icon.png"
              className="h-12 mr-1"
              alt="F1 Logo"
            />
            <div className="flex flex-col">
              <span className="self-center text-2xl font-semibold whitespace-nowrap">
                Champions
              </span>
              <span className="text-xs">
                Season {SEASONS_RANGE[0]}-{SEASONS_RANGE[1]}
              </span>
            </div>
          </a>
          <div className="w-auto">
            <ul className="font-medium text-lg flex flex-row space-x-8">
              <li>
                <Link
                  to={HOME}
                  className="hover:text-blue-700"
                  aria-current="page"
                  title="Go to Home page"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to={SEASONS}
                  className="hover:text-blue-700"
                  title="Go to Seasons page to view seasons full information"
                >
                  Seasons
                </Link>
              </li>
              <li>
                <Link
                  to={ABOUT}
                  className="hover:text-blue-700"
                  title="Go to About page to see SPA description and targets"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to={CONTACT}
                  className="hover:text-blue-700"
                  title="Go to Contact page to check SPA author information and contacts"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
