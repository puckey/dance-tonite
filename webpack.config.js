/* eslint global-require: 0 */
const webpack = require('webpack');
const path = require('path');
require('@epegzz/sass-vars-loader');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const querystring = require('querystring');
require('html-loader');

const NODE_ENV = process.env.NODE_ENV || 'development';
const CDN_RESOURCES = process.env.CDN_RESOURCES;
const CDN_API = process.env.CDN_API;

const sassVarsConfig = querystring.stringify({
  vars: [JSON.stringify({
    production: NODE_ENV === 'production',
  })],
});

const config = {
  devtool: process.env.NODE_ENV === 'production' ? null : 'source-map',
  entry: {
    jsx: './index.js',
  },
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'bundle.js',
    sourcePrefix: '',
    publicPath: '/',
  },
  module: {
    loaders: [
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', ['css-loader?minimize', 'autoprefixer']),
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style', [
          'css-loader?minimize',
          'autoprefixer',
          'sass',
          `@epegzz/sass-vars-loader?${sassVarsConfig}`,
        ]),
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: [
          'babel-loader',
        ],
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.(png|gif|jpg|jpeg|mp3|otf|woff|woff2|svg|obj)$/,
        loader: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['', '.js'],
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      verbose: true,
      dry: false,
    }),
    new CopyWebpackPlugin([
      { from: 'public', to: '../dist/public' },
    ]),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
        CDN_RESOURCES: JSON.stringify(CDN_RESOURCES),
        CDN_API: JSON.stringify(CDN_API),
      },
    }),
    new HtmlWebpackPlugin({
      inject: true,
      cache: false,
      template: 'templates/index.html',
      title: 'You Move Me',
      favicon: './public/favico.png',
    }),
    new webpack.ExtendedAPIPlugin(),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'async',
    }),
    new ExtractTextPlugin('style.css'),
  ],
  devServer: {
    contentBase: './src',
    host: '0.0.0.0',
    port: 3000,
  },
  context: path.resolve(__dirname, 'src'),
};

if (process.env.NODE_ENV === 'production' && process.env.RG_ENV !== 'dev') {
  config.plugins = config.plugins.concat(
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false,
      },
    }) // eslint-disable-line comma-dangle
  );
}

module.exports = config;
