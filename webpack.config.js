const libName = 'pepper';
const output = `${libName}.js`;

const aliases = {
  'react': 'preact-compat',
  'react-dom': 'preact-compat',
};

module.exports = {
  entry: `${__dirname}/index.js`,
  resolve: {
    alias: aliases,
  },
  output: {
    path: `${__dirname}/lib`,
    filename: output,
    library: libName,
    libraryTarget: 'var',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: require.resolve("babel-loader"),
        },
        exclude: /node_modules/,
      },
      {
        test: /\.s?(a|c)ss$/,
        use: [
          require.resolve("style-loader"),
          require.resolve("css-loader"),
          require.resolve("sass-loader"),
        ],
      }
    ]
  }
};
