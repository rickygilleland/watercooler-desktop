/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const ThreadsPlugin = require("threads-plugin");

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  // janus.js does not use 'import' to access to the functionality of webrtc-adapter,
  // instead it expects a global object called 'adapter' for that.
  // Let's make that object available.
  new webpack.ProvidePlugin({ adapter: ["webrtc-adapter", "default"] }),
  new webpack.DefinePlugin({
    "process.env.REACT_APP_PLATFORM": JSON.stringify("electron"),
  }),
  new ThreadsPlugin(),
];
