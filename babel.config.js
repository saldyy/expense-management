module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Lets `import migrations from './migrations/migrations'` pull the generated
    // .sql files into the bundle. The Reanimated/worklets plugin is added by
    // babel-preset-expo automatically — do not add it here.
    plugins: [['inline-import', { extensions: ['.sql'] }]],
  };
};
