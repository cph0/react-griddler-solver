module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['eslint-plugin-react-compiler'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react-compiler/react-compiler': 'error'
  },
}

// import react from 'eslint-plugin-react';
// import reactCompiler from 'eslint-plugin-react-compiler';
// import eslint from '@eslint/js';
// import tseslint from 'typescript-eslint';

// export default tseslint.config(
//     //react.configs.flat.recommended,
//   //eslint.configs.recommended,
//   //tseslint.configs.recommended,
//   {
//     files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
//     plugins: {
//       'react-compiler': reactCompiler,
//     },
//     rules: {
//     //   'no-unused-vars': 'off',
//     //   'no-undef': 'off',
//     //'react/no-children-prop':'error',
//       'react-compiler/react-compiler': 'error',
//     },
//   }
// );

// export default [
//         //js.configs.recommended,
//     react.configs.flat.recommended,
//     {
//         files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
//         ignores: ["out/", "dist/", "node_modules/"],
//         // plugins: {
//         //     react,
//         //     'react-compiler': reactCompiler,
//         // },
//         rules: {
//              //"no-unused-vars": "error",
//             //"no-undef": "error",
//         //'react-compiler/react-compiler': 'error',
//         },
//     }
// ];