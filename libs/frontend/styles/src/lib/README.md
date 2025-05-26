# F1 Champions App Tailwind Theme

This library provides a shared Tailwind CSS theme for both SPA and Mobile apps in the F1 Champions App.

## Features

- Custom font definitions for TT Hoves Pro Trial and TT Hoves Pro Mono Trial
- Shared Tailwind configuration
- Utility functions for extending the base theme

## Usage

### 1. Install Tailwind CSS

First, make sure you have Tailwind CSS installed in your app:

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

### 2. Import the font styles

In your main CSS file, import the font styles:

```css
/* For SPA app (e.g., apps/f1-spa/src/styles.css) */
@import 'fonts.css';
```

### 3. Configure Tailwind

Create a `tailwind.config.js` file in your app directory:

```javascript
// For SPA app (e.g., apps/f1-spa/tailwind.config.js)
import { createTailwindConfig } from '@f1-champions/styles';

export default createTailwindConfig({
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    // Add any other content paths specific to your app
  ],
  // Add any app-specific customizations here
});
```

### For React Native (Mobile) app

For React Native, you'll need to use a library like `tailwind-rn` and import the theme:

```javascript
// apps/f1-mobile/tailwind.config.js
import { tailwindTheme } from '@f1-champions/styles';

export default {
  content: [],
  theme: tailwindTheme,
  // Add any mobile-specific customizations here
};
```

## Available Font Classes

### Hoves Font (Sans-serif)

- `font-hoves` - Font family
- `font-thin` - Weight 100
- `font-light` - Weight 300
- `font-normal` - Weight 400
- `font-medium` - Weight 500
- `font-bold` - Weight 700

### Hoves Mono Font (Monospace)

- `font-hoves-mono` - Font family
- `font-normal` - Weight 400
- `font-medium` - Weight 500
- `font-bold` - Weight 700
