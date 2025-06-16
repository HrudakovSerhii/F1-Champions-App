import { defineConfig } from 'vitest/config';

import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'f1-frontend-styles',
      fileName: 'index',
    },
  },
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/styles',
  plugins: [],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
});
