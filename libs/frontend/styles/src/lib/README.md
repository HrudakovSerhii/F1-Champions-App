# F1 Champions App Tailwind Theme

This library provides a shared Tailwind CSS theme for both SPA and Mobile apps in the F1 Champions App.

## Features

- Shared Tailwind configuration
- Utility functions for extending the base theme

## Usage

### 1. Install Tailwind CSS

First, make sure you have Tailwind CSS installed in your app:

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

### 2. Configure Tailwind

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
// apps/mobile-app/tailwind.config.js
import { tailwindTheme } from '@f1-champions/styles';

export default {
  content: [],
  theme: tailwindTheme,
  // Add any mobile-specific customizations here
};
```
