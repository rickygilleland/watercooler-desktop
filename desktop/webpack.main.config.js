const rules = require('./webpack.rules');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/main.js',
  // Put your normal webpack config below here
  module: {
    rules: rules
  },
  plugins: [
    new CopyPlugin([
      { from: "src/sentry.js", to: "sentry.js" },
      { from: "../icons", to: "icons"}
    ]),
  ]
};