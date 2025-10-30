module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './',
            '@components': './components',
            '@hooks': './hooks',
            '@constants': './constants',
            '@assets': './assets',
            '@app': './app',
            '@src': './src',
          },
          extensions: [
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
            '.android.js',
            '.android.tsx',
            '.ios.js',
            '.ios.tsx',
          ],
        },
      ],
      // Reanimated musi być ostatni plugin
      'react-native-reanimated/plugin',
    ],
  }
}
