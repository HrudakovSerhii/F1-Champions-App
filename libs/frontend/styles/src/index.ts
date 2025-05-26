export * from './lib/styles.js';

// Export the theme from the CommonJS file
// Note: We need to use require() since theme.cjs is CommonJS
const themeExports = require('./lib/theme.cjs');

export const {
  fontDefinitions,
  designTokens,
  generateFontFaceCSS,
  getFontCSS,
  tailwindTheme,
  cssUtilities,
  initializeTheme,
  f1Theme,
} = themeExports;
