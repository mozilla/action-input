const path = require("path");

module.exports = {
  entry: ["babel-polyfill", "./src/action/ActionManager.js"],
  output: {
    filename: "xr-input.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname)],
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env"]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [".js"]
  }
};
