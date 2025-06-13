import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(({ mode }) => {
  // Docker environment detection
  const isDocker =
    process.env.DOCKER_ENV === 'true' || process.env.NODE_ENV === 'docker';
  const isDevelopment = mode === 'development';

  return {
    root: __dirname,
    cacheDir: '../../node_modules/.vite/apps/web-app',

    // More flexible base path configuration
    base: process.env.VITE_BASE_PATH || '/',

    server: {
      port: process.env.PORT ? Number(process.env.PORT) : 3000,
      // Docker-friendly host binding
      host:
        isDocker || process.env.HOST === '0.0.0.0' ? '0.0.0.0' : 'localhost',
      // Enable CORS for Docker development
      cors: isDevelopment,
      // Serve fonts from root public directory during development
      fs: {
        allow: ['..', '../../../public'],
      },
      // Docker-friendly HMR
      hmr: isDevelopment
        ? {
            port: process.env.HMR_PORT ? Number(process.env.HMR_PORT) : 24678,
            host: '0.0.0.0',
            clientPort: process.env.HMR_PORT
              ? Number(process.env.HMR_PORT)
              : 24678,
          }
        : false,
    },

    preview: {
      port: process.env.PREVIEW_PORT ? Number(process.env.PREVIEW_PORT) : 4300,
      host: isDocker ? '0.0.0.0' : 'localhost',
    },

    plugins: [react(), nxViteTsPaths()],

    // Define environment variables for the browser
    define: {
      __DEV__: isDevelopment,
    },

    resolve: {
      alias: {
        '@': resolve(__dirname, './app'),
      },
    },

    // Serve static assets from root public directory
    publicDir: isDevelopment
      ? resolve(__dirname, '../../../public')
      : resolve(__dirname, './public'),

    // Uncomment this if you are using workers.
    // worker: {
    //  plugins: [ nxViteTsPaths() ],
    // },

    build: {
      outDir: './dist',
      emptyOutDir: true,
      reportCompressedSize: true,
      // Docker-optimized build settings
      chunkSizeWarningLimit: 1000,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        // Optimize for Docker container size
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },

    // Optimized for Docker environments
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },

    test: {
      watch: false,
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./app/test-setup.ts'],
      include: [
        'app/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
      reporters: ['default'],
      coverage: {
        reportsDirectory: './test-output/vitest/coverage',
        provider: 'v8' as const,
      },
    },
  };
});
