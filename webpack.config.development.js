/* eslint max-len: 0 */
//This config is for renderer process
const webpack = require("webpack");
const baseConfig = require("./webpack.config.base");
const path = require("path");

const config = {
  ...baseConfig,
  mode: "development",
  devtool: "inline-source-map",

  entry: {
    background: [
      "webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr",
      "./app/background/background"
    ],
    index: [
      "webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr",
      "./app/main/index"
    ],
    feedback: [
      "webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr",
      "./app/main/windows/feedback/feedback"
    ]
  },

  output: {
    ...baseConfig.output,
    publicPath: "http://localhost:3000/dist/"
  },

  module: {
    ...baseConfig.module,
    rules: [
      ...baseConfig.module.rules,
      {
        test: /\.node$/,
        loader: "node-loader"
      },
      {
        test: /global\.css$/,
        use: ["style-loader", "css-loader?sourceMap"]
      },

      {
        test: /^((?!global).)*\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: "[name]__[local]___[hash:base64:5]"
            }
          },
          "postcss-loader"
        ]
      }
    ]
  },

  plugins: [
    ...baseConfig.plugins,
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    new webpack.HotModuleReplacementPlugin()
  ],

  target: "electron-renderer"
};

module.exports = config;
