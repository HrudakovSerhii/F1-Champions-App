import type { Config } from 'tailwindcss';
import { tailwindConfig, tailwindTheme } from './tailwind-theme.js';

/**
 * Creates a Tailwind config by merging the base config with custom overrides
 *
 * @param customConfig - Custom Tailwind configuration to merge with the base config
 * @returns A complete Tailwind configuration
 */
export function createTailwindConfig(
  customConfig: Partial<Config> = {}
): Config {
  return {
    content: customConfig.content || [],
    theme: {
      ...tailwindTheme,
      ...(customConfig.theme || {}),
      extend: {
        ...((tailwindTheme || {}).extend || {}),
        ...(customConfig.theme?.extend || {}),
      },
    },
    plugins: [
      ...(tailwindConfig.plugins || []),
      ...(customConfig.plugins || []),
    ],
    ...customConfig,
  } as Config;
}
