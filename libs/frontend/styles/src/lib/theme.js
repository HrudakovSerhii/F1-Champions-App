/**
 * Font definitions with paths relative to the public directory
 */
const fontDefinitions = {
  'TT Hoves Pro Trial': {
    weights: {
      100: 'TT_Hoves_Pro_Trial_Thin.ttf',
      300: 'TT_Hoves_Pro_Trial_Light.ttf',
      400: 'TT_Hoves_Pro_Trial_Regular.ttf',
      500: 'TT_Hoves_Pro_Trial_Medium.ttf',
      700: 'TT_Hoves_Pro_Trial_Bold.ttf',
    },
  },
  'TT Hoves Pro Mono Trial': {
    weights: {
      400: {
        woff2: 'TT_Hoves_Pro_Mono_Trial_Regular.woff2',
        woff: 'TT_Hoves_Pro_Mono_Trial_Regular.woff',
        ttf: 'TT_Hoves_Pro_Mono_Trial_Regular.ttf',
      },
      500: {
        woff2: 'TT_Hoves_Pro_Mono_Trial_Medium.woff2',
        woff: 'TT_Hoves_Pro_Mono_Trial_Medium.woff',
        ttf: 'TT_Hoves_Pro_Mono_Trial_Medium.ttf',
      },
      700: {
        woff2: 'TT_Hoves_Pro_Mono_Trial_Bold.woff2',
        woff: 'TT_Hoves_Pro_Mono_Trial_Bold.woff',
        ttf: 'TT_Hoves_Pro_Mono_Trial_Bold.ttf',
      },
    },
  },
};

/**
 * Design tokens - expandable for colors, spacing, etc.
 */
const designTokens = {
  colors: {
    // Brand colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },
    // F1 specific colors
    f1: {
      red: '#e10600',
      black: '#15151e',
      white: '#ffffff',
      silver: '#c0c0c0',
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
};

/**
 * Generate CSS font-face declarations
 */
function generateFontFaceCSS(basePath = '/fonts') {
  let css = '/* F1 Theme - Generated Font Faces */\n';

  // TT Hoves Pro Trial fonts
  Object.entries(fontDefinitions['TT Hoves Pro Trial'].weights).forEach(
    ([weight, filename]) => {
      css += `
@font-face {
  font-family: 'TT Hoves Pro Trial';
  src: url('${basePath}/${filename}') format('truetype');
  font-weight: ${weight};
  font-style: normal;
  font-display: swap;
}`;
    }
  );

  // TT Hoves Pro Mono Trial fonts
  Object.entries(fontDefinitions['TT Hoves Pro Mono Trial'].weights).forEach(
    ([weight, formats]) => {
      if (typeof formats === 'object') {
        const srcParts = [
          `url('${basePath}/${formats.woff2}') format('woff2')`,
          `url('${basePath}/${formats.woff}') format('woff')`,
          `url('${basePath}/${formats.ttf}') format('truetype')`,
        ];

        css += `
@font-face {
  font-family: 'TT Hoves Pro Mono Trial';
  src: ${srcParts.join(',\n  ')};
  font-weight: ${weight};
  font-style: normal;
  font-display: swap;
}`;
      }
    }
  );

  return css;
}

/**
 * Get font CSS as a string for dynamic injection
 * Usage: Create a <style> tag with this content in your app
 */
function getFontCSS(basePath = '/fonts') {
  return generateFontFaceCSS(basePath);
}

/**
 * Complete Tailwind theme configuration
 */
const tailwindTheme = {
  fontFamily: {
    hoves: ['TT Hoves Pro Trial', 'sans-serif'],
    'hoves-mono': ['TT Hoves Pro Mono Trial', 'monospace'],
    sans: ['TT Hoves Pro Trial', 'system-ui', 'sans-serif'],
    mono: ['TT Hoves Pro Mono Trial', 'Menlo', 'monospace'],
  },
  colors: {
    ...designTokens.colors,
    // Tailwind defaults can be preserved or overridden
  },
  spacing: {
    ...designTokens.spacing,
  },
  borderRadius: {
    ...designTokens.borderRadius,
  },
  boxShadow: {
    ...designTokens.shadows,
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
 * CSS utility classes (can be used in components)
 */
const cssUtilities = {
  // Typography
  heading: {
    h1: 'font-hoves font-bold text-4xl leading-tight',
    h2: 'font-hoves font-bold text-3xl leading-tight',
    h3: 'font-hoves font-bold text-2xl leading-tight',
    h4: 'font-hoves font-medium text-xl leading-tight',
  },
  text: {
    body: 'font-hoves font-normal text-base leading-relaxed',
    caption: 'font-hoves font-light text-sm leading-normal',
    mono: 'font-hoves-mono font-normal text-sm leading-normal',
  },
  // Layout
  container: {
    default: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    narrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
  },
  // Components
  button: {
    primary:
      'bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors',
    secondary:
      'bg-secondary-200 hover:bg-secondary-300 text-secondary-900 font-medium py-2 px-4 rounded-md transition-colors',
  },
};

/**
 * Theme initialization function
 */
function initializeTheme(options = {}) {
  const { fontBasePath = '/fonts' } = options;

  return {
    tokens: designTokens,
    utilities: cssUtilities,
    tailwind: tailwindTheme,
    fontCSS: getFontCSS(fontBasePath),
  };
}

/**
 * Complete F1 theme export
 */
const f1Theme = {
  // Core design tokens
  tokens: designTokens,
  fonts: fontDefinitions,

  // Fonts CSS
  fontsCSSPath: './fonts.css', // Relative path to fonts.css file

  // Tailwind configuration
  tailwind: {
    theme: tailwindTheme,
    plugins: [],
  },

  // CSS utilities
  utilities: cssUtilities,

  // Functions
  generateFontCSS: generateFontFaceCSS,
  getFontCSS,
  initialize: initializeTheme,
};

module.exports = {
  fontDefinitions,
  designTokens,
  generateFontFaceCSS,
  getFontCSS,
  tailwindTheme,
  cssUtilities,
  initializeTheme,
  f1Theme,
};
