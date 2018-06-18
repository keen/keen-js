const path = require('path');
const webpack = require('webpack');

let extendedPath = path.resolve(__dirname, 'dist');

let fileName = 'keen';
if (process.env.BUNDLE) {
  fileName = `${fileName}.bundle`; // for loading via html script tag => window vars
} else {
  fileName = `${fileName}.umd`; // npm module
}

const entry = ( process.env.TARGET !== 'node' ) ? './lib/browser.js' : './lib/server.js' ;

module.exports = {
  entry,

  target: process.env.TARGET ? `${process.env.TARGET}` : 'web',

  output: {
    path: extendedPath,
    filename: `${
      process.env.TARGET ? `${process.env.TARGET}/` : ''
    }${
      fileName
    }${
      process.env.OPTIMIZE_MINIMIZE ? '.min' : ''
    }.js`,
    library: `${!process.env.LIBRARY ? '' : process.env.LIBRARY}`,
    libraryTarget: 'umd',
  },

  module: {

    rules: [
      {
        test: /\.js?$/,
        include: [
          path.resolve(__dirname, 'lib'),
        ],
        exclude: [
          path.resolve(__dirname, 'node_modules'),
        ],
        loader: 'babel-loader',
      },

      {
        test: /\.html$/,
        loader: 'html-loader',
      },
    ],

  },

  resolve: {
    modules: [
      'node_modules',
    ],
    extensions: ['.js', '.json', '.jsx'],
  },

  optimization: {
    minimize: !!process.env.OPTIMIZE_MINIMIZE,
  },

  devtool: 'source-map',

  context: __dirname,

  // stats: 'verbose',

  plugins: [
    new webpack.DefinePlugin({
      KEEN_GLOBAL_OBJECT:
        JSON.stringify(process.env.BUNDLE),
    }),
  ],

  mode: process.env.NODE_ENV,

  devServer: {
    contentBase: path.join(__dirname, 'test/demo'),
    open: true,
    inline: true,
    hot: false,
    watchContentBase: true,
  },

  externals: process.env.BUNDLE || process.env.NODE_ENV === 'development' ? {} : {
    'keen-dataviz': 'keen-dataviz',
    'keen-tracking': 'keen-tracking',
    'keen-analysis': 'keen-analysis',
    'keen-core': 'keen-core',
  },

};
