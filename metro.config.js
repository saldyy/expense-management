const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Drizzle emits migrations as .sql files that babel-plugin-inline-import inlines.
config.resolver.sourceExts.push('sql');

module.exports = config;
