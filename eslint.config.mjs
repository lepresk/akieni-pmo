import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

/**
 * Flat ESLint config for the Akieni PMO Next.js app.
 * Strictness lives in tsconfig; ESLint enforces a small set of hard rules and
 * defers formatting entirely to Prettier (eslint-config-prettier disables all
 * stylistic rules so the two never conflict).
 */
export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'out/**',
      'coverage/**',
      'drizzle/**',
      'node_modules/**',
      'next-env.d.ts',
      // Claude Design prototype bundle - reference material, not app source.
      'docs/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['error'] }],
    },
  },
  prettierConfig,
);
