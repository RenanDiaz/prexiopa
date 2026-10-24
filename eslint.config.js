import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', '.wrangler', 'node_modules', 'worker-configuration.d.ts', 'spikes'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: ['scripts/**/*.mjs', '*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  {
    // Spec §6.4: D1 no tiene RLS. Solo worker/db/ toca la BD; el resto usa scoped().
    files: ['worker/**/*.ts', 'src/**/*.{ts,tsx}'],
    ignores: ['worker/db/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['drizzle-orm', 'drizzle-orm/*', '**/db/client', '**/db/schema'],
              message: 'Accede a datos solo vía worker/db/scoped.ts (spec §6.4).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: { '@typescript-eslint/no-empty-object-type': 'off' },
  },
);
