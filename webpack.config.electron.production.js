//This config is for main process
const webpack = require("webpack");
const baseElectronConfig = require("./webpack.config.electron");
const path = require("path");

const config = {
  ...baseElectronConfig,
  mode: "production",

  resolve: {
    ...baseElectronConfig.resolve,
    alias: {
      ...baseElectronConfig.resolve.alias,
      Environment: path.resolve(
        __dirname,
        `app/environment/${process.env.CHIPI_ENV || "production"}`
      )
    }
  }
};

module.exports = config;
