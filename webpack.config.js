const HTMLWebpackPlugin = require("html-webpack-plugin");
const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: __dirname + "/public/index.html",
  filename: "index.html",
  inject: "body"});

module.exports = {
  entry: __dirname + "/public/index.js",
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node-modules/,
        loader: "babel-loader"
      }
    ]
  }, output: {
    filename: "bundle.js",
    path: __dirname + "/build"
  },
  plugins: [HTMLWebpackPluginConfig]
};
