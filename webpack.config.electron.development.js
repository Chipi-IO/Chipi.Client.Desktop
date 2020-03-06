//This config is for main process
const path = require('path');
const webpack = require('webpack');
const baseElectronConfig = require('./webpack.config.electron');

const config = {
  ...baseElectronConfig,
  mode: "development"
}

module.exports = config;