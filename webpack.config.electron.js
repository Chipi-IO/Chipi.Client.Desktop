const webpack = require("webpack");
const baseConfig = require("./webpack.config.base");

const isProduction = process.env.NODE_ENV === "production";

const plugins = [
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      HOT: JSON.stringify(process.env.HOT)
    }
  })
];

module.exports = {
  ...baseConfig,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },

  plugins,

  devtool: "source-map",
  entry: "./app/app.development",

  output: {
    ...baseConfig.output,
    path: __dirname,
    filename: "./app/app.js"
  },

  target: "electron-main",

  node: {
    __dirname: false,
    __filename: false
  }
};
