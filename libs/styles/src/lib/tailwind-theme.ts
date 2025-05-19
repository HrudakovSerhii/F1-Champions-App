import type { Config } from 'tailwindcss';

/**
 * Custom Tailwind theme that includes font families from the public/fonts directory
 * This theme can be imported and used in both SPA and Mobile apps
 */
export const tailwindTheme: Partial<Config['theme']> = {
  fontFamily: {
    'hoves': [
      'TT Hoves Pro Trial',
      'sans-serif',
    ],
    'hoves-mono': [
      'TT Hoves Pro Mono Trial',
      'monospace',
    ],
  },
  extend: {
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      bold: '700',
    },
  },
};

/**
 * Custom Tailwind CSS configuration
 * This can be extended in app-specific configurations
 */
export const tailwindConfig: Partial<Config> = {
  theme: tailwindTheme,
  // Common plugins can be added here if needed
  plugins: [],
}; 