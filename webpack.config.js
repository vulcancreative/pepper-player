const path = require("path");
const process = require("process");
const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-size-analyzer")
  .WebpackBundleSizeAnalyzerPlugin;

const mode = process.env.NODE_ENV || "development";

const libName = "pepper";
const output = `${libName}.js`;

const aliases = {
  react: "preact-compat",
  "react-dom": "preact-compat"
};

const optimization =
  mode !== "development"
    ? {
        minimizer: [
          new UglifyJsPlugin({
            cache: true,
            parallel: true,
            uglifyOptions: {
              sourceMap: true,
              output: { comments: false },
              mangle: true,
              compress: {
                properties: true,
                keep_fargs: false,
                pure_getters: true,
                collapse_vars: true,
                warnings: false,
                sequences: true,
                dead_code: true,
                drop_debugger: true,
                comparisons: true,
                conditionals: true,
                evaluate: true,
                booleans: true,
                loops: true,
                passes: 4,
                unused: true,
                hoist_funs: true,
                if_return: true,
                join_vars: true,
                reduce_vars: true,
                drop_console: true,
                pure_funcs: [
                  "classCallCheck",
                  "_classCallCheck",
                  "_possibleConstructorReturn",
                  "Object.freeze",
                  "invariant",
                  "warning"
                ]
              }
            },
            sourceMap: true
          })
        ]
      }
    : {};

module.exports = {
  mode: mode,
  stats: "errors-only",
  entry: path.resolve(__dirname, "src", "player.js"),
  optimization: optimization,
  resolve: {
    alias: aliases
  },
  output: {
    path: `${__dirname}/lib`,
    filename: output,
    library: libName,
    libraryTarget: "umd",
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [require.resolve("babel-loader")],
        exclude: /node_modules/
      },
      {
        test: /\.s?(a|c)ss$/,
        use: [
          require.resolve("style-loader"),
          require.resolve("css-loader"),
          require.resolve("sass-loader")
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(mode),
      __isBrowser__: "true"
    }),
    /*
    new webpack.BannerPlugin({
      banner: `Copyright (c) ${(new Date().getFullYear())} Vulcan, LLC.`,
      entryOnly: true,
    }),
    */
    new BundleAnalyzerPlugin(path.resolve(__dirname, "report.txt"))
  ]
};
