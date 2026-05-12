import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
        globals: {...globals.node}
      },
    },
    plugins: {tsPlugin: tsPlugin},
    ...tsPlugin.configs,
    ...prettierConfig,
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
    ignores: ['eslint.config.js']
  },
];

// module.exports = {
//   parser: '@typescript-eslint/parser',
//   parserOptions: {
//     project: 'tsconfig.json',
//     tsconfigRootDir: __dirname,
//     sourceType: 'module',
//   },
//   plugins: ['@typescript-eslint/eslint-plugin'],
//   extends: [
//     'plugin:@typescript-eslint/recommended',
//     'plugin:prettier/recommended',
//   ],
//   root: true,
//   env: {
//     node: true,
//     jest: true,
//   },
//   ignorePatterns: ['eslint.config.js'],
//   rules: {
//     '@typescript-eslint/interface-name-prefix': 'off',
//     '@typescript-eslint/explicit-function-return-type': 'off',
//     '@typescript-eslint/explicit-module-boundary-types': 'off',
//     '@typescript-eslint/no-explicit-any': 'off',
//   },
// };
