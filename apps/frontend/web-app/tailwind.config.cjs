const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

const { f1Theme } = require('../../../libs/frontend/styles/src');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    ...f1Theme,
  },
  plugins: [],
};
