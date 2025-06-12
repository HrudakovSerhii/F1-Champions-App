// Export the theme from the JavaScript file
// @ts-expect-error Theme object untyped
import themeExports from './lib/theme.js';

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

export { themeExports as defaultTheme };
