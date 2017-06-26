/* eslint global-require: 0 */
const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const NODE_ENV = process.env.NODE_ENV || 'development';
const FLAVOR = process.env.FLAVOR || 'website';

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
          'sass?sourceMap',
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
        test: /\.(png|gif|jpg|jpeg|mp3|otf|woff|woff2|obj|ogg)$/,
        loader: 'file-loader',
      },
      {
        test: /.*\.svg$/,
        loaders: [
          'string-loader',
          `svgo-loader?${JSON.stringify({
            plugins: [
              { removeTitle: true },
              { convertColors: { shorthex: false } },
              { convertPathData: false },
            ],
          })}`,
        ],
      },
      {
        test: /\.md$/,
        loaders: [
          'file-loader',
          `markdown-loader?${JSON.stringify({
            smartypants: true,
          })}`,
        ],
      },
    ],
  },
  resolve: {
    extensions: ['', '.js'],
    alias: {
      THREE: path.resolve(__dirname, './src/lib/three.js'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      verbose: true,
      dry: false,
    }),
    new CopyWebpackPlugin([
      { from: 'public', to: '../dist/public' },
      { from: 'templates/_redirects', to: '../dist/' },
    ]),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
        FLAVOR: JSON.stringify(FLAVOR),
      },
    }),
    new HtmlWebpackPlugin({
      inject: true,
      cache: false,
      template: `templates/${FLAVOR === 'cms' ? 'cms' : 'index'}.html`,
      title: 'You Move Me',
      favicon: './public/favico.png',
    }),
    new webpack.ExtendedAPIPlugin(),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'async',
    }),
    new ExtractTextPlugin('style.css'),
    new webpack.ProvidePlugin({
      THREE: 'THREE',
    }),
    new webpack.NormalModuleReplacementPlugin(
      (/^three$/),
      require.resolve('./src/lib/three')
    ),
  ],
  devServer: {
    contentBase: './src',
    host: '0.0.0.0',
    port: 3000,
    disableHostCheck: true,
  },
  context: path.resolve(__dirname, 'src'),
};

if (process.env.NODE_ENV === 'production' && process.env.RG_ENV !== 'dev') {
  config.plugins = config.plugins.concat(
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false,
      },
    })
  );
}

if (process.env.ANALYZE_BUNDLE) {
  config.plugins = config.plugins.concat(
    new BundleAnalyzerPlugin({
      defaultSizes: 'gzip',
    })
  );
}

module.exports = config;
