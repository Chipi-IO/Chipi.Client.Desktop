module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
  sourceType: "unambiguous",
  //plugins: ["react-hot-loader/babel"],
  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        absoluteRuntime: false,
        corejs: false,
        helpers: false,
        regenerator: true,
        useESModules: false
      }
    ],
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread"
  ],
  env: {
    production: {
      plugins: ["babel-plugin-transform-remove-debugger"]
    },
    test: {
      plugins: ["babel-plugin-add-module-exports", "babel-plugin-transform-es2015-modules-commonjs"]
    }
  }
};
