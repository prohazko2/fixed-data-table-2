var webpack = require('webpack');
var resolvers = require('./build_helpers/resolvers');
var path = require('path');
var glob = require('glob');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
var packageJSON = require('./package.json');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var isDev = JSON.stringify(process.env.NODE_ENV !== 'production');

var banner = (
  '/**\n' +
  ' * FixedDataTable v' + packageJSON.version + ' \n' +
  ' *\n' +
  ' * Copyright Schrodinger, LLC\n' +
  ' * All rights reserved.\n' +
  ' *\n' +
  ' * This source code is licensed under the BSD-style license found in the\n' +
  ' * LICENSE file in the root directory of this source tree. An additional grant\n' +
  ' * of patent rights can be found in the PATENTS file in the same directory.\n' +
  ' */\n'
);

var plugins = [
  new MiniCssExtractPlugin({
    filename: '[name].css',
  }),
  new webpack.DefinePlugin({
    '__DEV__': isDev
  })
];

var entry = {};
var baseEntryPoints = glob.sync(
  path.join(__dirname, './src/css/layout/*.css')
);

var styleEntryPoints = glob.sync(
  path.join(__dirname, './src/css/style/*.css')
);

var mainEntryPoints = glob.sync(
  path.join(__dirname, './src/**/*.css')
);
mainEntryPoints.push('./src/FixedDataTableRoot.js');

if (process.env.COMPRESS) {
  entry['fixed-data-table-base.min'] = baseEntryPoints;
  entry['fixed-data-table-style.min'] = styleEntryPoints;
  entry['fixed-data-table.min'] = mainEntryPoints;
} else {
  entry['fixed-data-table-base'] = baseEntryPoints;
  entry['fixed-data-table-style'] = styleEntryPoints;
  entry['fixed-data-table'] = mainEntryPoints;
}

plugins.push(
  new webpack.BannerPlugin({ banner, raw: true })
);

module.exports = {
  mode: isDev === 'true' ? 'development' : 'production',
  resolve: {
    plugins: [resolvers.resolveHasteDefines]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // only enable hot in development
              hmr: isDev === 'true',
              fallback: 'style-loader'
            }
          },
          'css-loader',
          path.join(__dirname, './build_helpers/cssTransformLoader'),
        ]
      },
    ],
  },

  entry: entry,

  output: {
    library: 'FixedDataTable',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },

  externals: {
    react: {
      root: 'React',
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
    },
    'prop-types': {
      root: 'PropTypes',
      commonjs: 'prop-types',
      commonjs2: 'prop-types',
      amd: 'prop-types',
    },
  },

  node: {
    Buffer: false
  },

  plugins: plugins
};

if (process.env.COMPRESS) {
  module.exports.optimization = {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compressor: {
            warnings: false
          },
          output: {comments: false}
        }
      })
    ]
  }
}
