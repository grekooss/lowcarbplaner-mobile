// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat')
const prettierConfig = require('eslint-config-prettier')

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    ignores: [
      'dist/*',
      'node_modules/*',
      '.expo/*',
      'android/*',
      'ios/*',
      'babel.config.js',
      'metro.config.js',
      'jest.config.js',
      'jest.setup.js',
      'MATCHTI/*',
      'WEB/*',
    ],
  },
]
