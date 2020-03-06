const webpack = require("webpack");
const config = require("./webpack.config.base");
const path = require("path");

(config.devtool = "cheap-module-eval-source-map"),
  (config.target = "electron-renderer");

config.plugins = [
  ...config.plugins,
  new webpack.LoaderOptionsPlugin({
    debug: true
  })
];

config.module = Object.assign(config.module, {
  rules: Array.prototype.concat.call(config.module.rules, [
    {
      test: /\.(css|svg|jpe?g|png)$/,
      use: "null-loader"
    },
    {
      test: /\.node$/,
      use: "node-loader"
    }
  ])
});

config.resolve = {
  ...config.resolve,
  alias: {
    ...config.resolve.alias,
    Environment: path.resolve(__dirname, "app/environment/development")
  }
};

module.exports = config;
