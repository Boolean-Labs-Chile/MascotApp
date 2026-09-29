const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
config.resolver.assetExts = [
  ...new Set([...config.resolver.assetExts, "wasm"]),
];
const enhanceMiddleware = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (middleware, server) => {
  const next = enhanceMiddleware
    ? enhanceMiddleware(middleware, server)
    : middleware;
  return (req, res, done) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next(req, res, done);
  };
};

module.exports = withNativeWind(config, { input: "./global.css" });
