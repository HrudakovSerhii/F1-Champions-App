const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

const {
  tailwindTheme,
} = require('../../../libs/frontend/styles/src/lib/theme.cjs');

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
    ...tailwindTheme,
  },
  plugins: [],
};
