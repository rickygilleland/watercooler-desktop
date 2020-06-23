const rules = require('./webpack.rules');
const webpack = require('webpack');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const package = require('./package.json')

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

rules.push({
  test: require.resolve('janus-gateway'),
  use: 'exports-loader?Janus=Janus'
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
  plugins: [
    // janus.js does not use 'import' to access to the functionality of webrtc-adapter,
    // instead it expects a global object called 'adapter' for that.
    // Let's make that object available.
    new webpack.ProvidePlugin({ adapter: 'webrtc-adapter' }),
    new SentryWebpackPlugin({
      include: '.',
      ignoreFile: '.sentrycliignore',
      ignore: ['node_modules', 'webpack.config.js'],
      configFile: 'sentry.properties',
      release: "watercooler-desktop@" + package.version,
    })
  ]
};
