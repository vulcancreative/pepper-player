const libName = 'pepper';
const output = `${libName}.js`;

module.exports = {
  entry: `${__dirname}/src/index.js`,
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
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.scss$/,
        use: [{
          loader: "style-loader"
        }, {
          loader: "css-loader"
        }, {
          loader: "sass-loader"
        }]
      }
    ]
  }
};
