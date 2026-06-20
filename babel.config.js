module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
            "@api": "./src/api",
            "@app": "./src/app",
            "@assets": "./src/assets",
            "@components": "./src/components",
            "@features": "./src/features",
            "@layouts": "./src/layouts",
            "@store": "./src/store",
            "@offline": "./src/offline",
            "@utils": "./src/utils",
            "@hooks": "./src/api/hooks",
            "@config": "./src/config",
            "@constants": "./src/constants"
          }
        }
      ],
      "react-native-reanimated/plugin"
    ]
  };
};