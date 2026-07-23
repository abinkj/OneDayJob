module.exports = function (api) {
  api.cache(true);
  const plugins = ["react-native-reanimated/plugin"];

  // Strip console.log statements in production builds to prevent leaking sensitive information
  if (process.env.NODE_ENV === "production") {
    plugins.push("transform-remove-console");
  }

  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
