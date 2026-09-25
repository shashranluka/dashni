module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // prop-types თანამედროვე React-ში პრაქტიკულად მიტოვებულია (მის ადგილას
    // TypeScript გამოიყენება) და პროექტში არასდროს დაცულა — 100-ზე მეტი
    // შენიშვნა რეალურ პრობლემებს ფარავდა. სადაც უკვე აღწერილია, ისე რჩება.
    'react/prop-types': 'off',
  },
  overrides: [
    {
      // კონფიგის ფაილები Node-ში სრულდება, სადაც process სტანდარტულია.
      // ამის გარეშე ESLint მათ ბრაუზერის კოდად თვლიდა და ცრუ განგაშს იძლეოდა.
      files: ['vite.config.js', '*.config.js', '*.cjs'],
      env: { node: true, browser: false },
    },
  ],
}
