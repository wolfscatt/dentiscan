module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@app': './src/app',
            '@navigation': './src/navigation',
            '@ui': './src/ui',
            '@components': './src/components',
            '@features': './src/features',
            '@services': './src/services',
            '@store': './src/store',
            '@utils': './src/utils',
            '@types': './src/types'
          }
        }
      ],
      'react-native-paper/babel'
    ]
  };
};
