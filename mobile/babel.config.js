module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // IMPORTANTE: react-native-reanimated/plugin DEVE ser o ÚLTIMO plugin
      'react-native-reanimated/plugin',
    ],
  };
};

