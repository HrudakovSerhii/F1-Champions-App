const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

// Import our custom tailwind theme
// Note: In a real project, you might need to adjust the import path based on how the library is built
// TODO: Update config to use build version of the lib instead of direct export
const {
  tailwindTheme,
} = require('../../../libs/frontend/styles/src/lib/tailwind-theme');

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
    extend: {
      ...((tailwindTheme || {}).extend || {}),
    },
  },
  plugins: [],
};
