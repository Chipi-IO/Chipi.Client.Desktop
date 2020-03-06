const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

// all dependecies from app/package.json will be included in build/node_modules
const externals = Object.assign(
  require("./app/package.json").dependencies,
  require("./app/package.json").optionalDependencies
);

module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loaders: ["babel-loader"],
        exclude: modulePath =>
          modulePath.match(/node_modules/) && !modulePath.match(/node_modules(\/|\\)cerebro-ui/)
      },
      {
        test: /\.(ts|tsx)$/,
        loader: "babel-loader",
        exclude: /(node_modules)/
      },
      {
        test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
        use: ["url-loader"],
        exclude: /(node_modules)/
      },
      {
        exclude: /node_modules/,
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader" // Creates style nodes from JS strings
          },
          {
            loader: "css-loader" // Translates CSS into CommonJS
          },
          {
            loader: "sass-loader" // Compiles Sass to CSS
          }
        ]
      }
    ]
  },
  output: {
    path: path.join(__dirname, "app"),
    filename: "[name].bundle.js",
    libraryTarget: "commonjs2"
  },
  resolve: {
    modules: [path.join(__dirname, "app"), "node_modules"],
    extensions: [".js", ".jsx", ".tsx", ".ts"],
    alias: {
      Environment: path.resolve(__dirname, `app/environment/uat`),
      "@app": path.resolve(__dirname, `app/`),
      "@app/lib": path.resolve(__dirname, "app/lib/")
    }
  },
  plugins: [
    new LodashModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      "process.env.HOT": JSON.stringify(process.env.HOT)
    }),
    new CopyWebpackPlugin([
      {
        from: "app/main/css/themes/*",
        to: "./main/css/themes/[name].[ext]"
      },
      {
        from: "node_modules/keytar/build/Release/keytar.node",
        to: "[name].[ext]"
      }
    ])
  ],
  externals: Object.keys(externals || {})
};
