/* eslint-disable @typescript-eslint/no-var-requires */
const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

rules.push({
  test: require.resolve("janus-gateway"),
  loader: "exports-loader",
  options: {
    exports: "Janus",
  },
});

rules.push({
  test: /\.wasm$/,
  type: "javascript/auto",
  use: [
    {
      loader: "file-loader",
    },
  ],
});

rules.push({
  test: /\.worker\.ts$/,
  use: ["workerize-loader"],
});

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
