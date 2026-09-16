const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Expo SQLite Web uses WebAssembly.
config.resolver.assetExts.push("wasm");

module.exports = config;