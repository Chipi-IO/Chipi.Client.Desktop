const webpack = require("webpack");
const path = require("path");
const baseConfig = require("./webpack.config.base");
const OptimizeJsPlugin = require("optimize-js-plugin");
const Visualizer = require("webpack-visualizer-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//This config is for renderer process

const config = {
  ...baseConfig,
  mode: "production",

  devtool: "source-map",

  entry: {
    index: "./app/main/index",
    background: "./app/background/background",
    feedback: "./app/main/windows/feedback/feedback"
  },

  output: {
    ...baseConfig.output,
    path: path.join(__dirname, "./app/dist"),
    publicPath: "../dist/"
  },

  module: {
    ...baseConfig.module,

    rules: [
      ...baseConfig.module.rules,
      {
        test: /global\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader"
          }
        ]
      },
      {
        test: /^((?!global).)*\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: "css-loader",
            options: {
              modules: true,
              importLoaders: 1,
              localIdentName: "[name]__[local]___[hash:base64:5]"
            }
          },
          "postcss-loader"
        ]
      },
      {
        test: /keytar\.node$/,
        loader: "./build_helper/native-keytar-loader"
      }
    ]
  },
  resolve: {
    ...baseConfig.resolve,
    alias: {
      ...baseConfig.resolve.alias,
      Environment: path.resolve(__dirname, `app/environment/${process.env.CHIPI_ENV || "production"}`)
    }
  },

  plugins: [
    ...baseConfig.plugins,
    new MiniCssExtractPlugin(),
    new OptimizeJsPlugin({
      sourceMap: false
    })
  ],

  target: "electron-renderer"
};

if (process.env.ANALYZE) {
  config.plugins.push(new Visualizer());
}

module.exports = config;
