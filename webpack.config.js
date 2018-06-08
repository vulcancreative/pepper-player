const fs = require('fs');
const copy = require('copy');
const path = require('path');
const colors = require('colors');
const process = require('process');
const webpack = require('webpack');
const gzipSize = require('gzip-size');
const logUpdate = require('log-update');
const timestamp = require('time-stamp');
const prettyBytes = require('pretty-bytes');
const consoleTable = require('console.table');

const mode = process.env.NODE_ENV || 'development';

const libName = 'pepper';
const output = `${libName}.js`;

let successIter = 0;

function SuccessPlugin() {
  this.start = null;
  this.watching = false;
  this.files = new Set();
  this.table = new Set();

  this.outputs = [
    'pepper.js',
  ];
}

SuccessPlugin.prototype.apply = function(compiler) {
  compiler.hooks.beforeCompile.tap('SuccessPlugin', () => {
    this.start = Date.now();
  });

  compiler.hooks.afterEmit.tap('SuccessPlugin', (compilation) => {
    const read = path.resolve(__dirname, '..', 'src', 'public', '*');
    const dest = path.resolve(__dirname, '..', 'lib');

    copy(read, dest, (err) => {
      if (err) { throw(err); }
    });

    compilation.chunks.forEach((chunk) => {
      chunk.files.forEach((filename) => {
        const parts = filename.split('/');
        const last = parts[parts.length - 1];

        if (this.outputs.includes(last)) {
          this.files.add(filename);
        }
      });
    });
  });

  compiler.hooks.done.tap('SuccessPlugin', () => {
    const files = Array.from(this.files).sort();

    for (let i = 0; i != files.length; i++) {
      const filepath = files[i];

      const fileparts = filepath.split('/');
      const filename = fileparts[fileparts.length - 1];

      const loc = path.resolve(__dirname, '..', 'lib', filepath);
      const data = fs.readFileSync(loc);

      this.table.add([
        filename || filepath,
        `${prettyBytes(data.length, { locale: 'de' })} ` +
        colors.green(
          `(${prettyBytes(gzipSize.sync(data), { local: 'de' })})`
        ),
      ]);
    }

    const table = consoleTable.getTable([
      'File',
      `Size ${colors.green('(gzipped)')}`
    ], Array.from(this.table));

    const delta = `${parseFloat(Date.now() - this.start) / 1000.0}s`;

    const iter = successIter + 1;
    logUpdate(
      `\nCompiled ${iter} ${iter === 1?'time':'times'} ` +
      `(${timestamp('YY.MM.DD HH:mm:ss')}, ${delta})\n\n` + table
    );

    this.files = new Set();
    this.table = new Set();

    successIter++;
  });
};

const aliases = {
  'react': 'preact-compat',
  'react-dom': 'preact-compat',
};

module.exports = {
  mode: mode,
  stats: 'errors-only',
  entry: `${__dirname}/index.js`,
  resolve: {
    alias: aliases,
  },
  output: {
    path: `${__dirname}/lib`,
    filename: output,
    library: libName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: 'typeof self !== \'undefined\' ? self : this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          require.resolve('babel-loader'),
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.s?(a|c)ss$/,
        use: [
          require.resolve('style-loader'),
          require.resolve('css-loader'),
          require.resolve('sass-loader'),
        ],
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(mode),
      __isBrowser__: 'true',
    }),
    new SuccessPlugin(),
  ],
};
