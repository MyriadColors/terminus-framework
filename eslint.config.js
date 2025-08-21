import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.eslint.json',
      },
      globals: {
        browser: true,
        es2020: true,
        document: true,
        setTimeout: true,
        requestAnimationFrame: true,
        __dirname: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      // Basic ESLint recommended rules
      ...eslint.configs.recommended.rules,
      
      // TypeScript ESLint recommended rules
      ...tseslint.configs.recommended.rules,
      
      // React ESLint recommended rules
      ...react.configs.recommended.rules,
      
      // React Hooks ESLint recommended rules
      ...reactHooks.configs.recommended.rules,
      
      // Custom rules for this project
      'react/react-in-jsx-scope': 'off', // Not needed for React 17+
      'react/prop-types': 'off', // We're using TypeScript
      '@typescript-eslint/no-unused-vars': 'off', // Disable for now, many unused vars in current code
      'no-unused-vars': 'off', // Disable for now
      '@typescript-eslint/no-explicit-any': 'off', // Disable for now, many any types in current code
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-undef': 'off', // Disable for now
      'react/no-unescaped-entities': 'off', // Disable for now
      'no-case-declarations': 'off', // Disable for now
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
);