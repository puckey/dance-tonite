/* eslint global-require: 0 */
const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';
const FLAVOR = process.env.FLAVOR || 'website';
const isProd = NODE_ENV === 'production';

const content = {
  title: 'Dance Tonite',
  description: 'An interactive VR experience by LCD Soundsystem and their fans.',
  sharedDescription: 'Check out my moves in this VR experience by LCD Soundsystem and their fans.',
  image: '/public/social.png',
};

const extractSass = new ExtractTextPlugin({
  filename: 'style.css',
  disable: process.env.NODE_ENV === 'development',
});

const htmlSettings = {
  inject: true,
  cache: false,
  title: 'Dance Tonite',
  favicon: './public/favico.png',
  inlineSource: '.(css)$',
};

const config = {
  devtool: process.env.NODE_ENV === 'production'
    ? false
    : 'eval-source-map',
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
    rules: [
      {
        test: /\.html$/,
        loader: 'html-loader',
      },
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: !isProd,
              },
            },
            {
              loader: 'postcss-loader',
              options: { sourceMap: !isProd },
            },
            {
              loader: 'sass-loader', options: { sourceMap: !isProd },
            },
          ],
          // use style-loader in development
          fallback: 'style-loader',
        }),
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(png|gif|jpg|jpeg|mp3|otf|woff|woff2|obj|ogg)$/,
        loader: 'file-loader',
      },
      {
        test: /.*\.svg$/,
        loaders: [
          'string-loader',
          'svgo-loader',
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
    extensions: ['.js'],
    alias: {
      THREE: path.resolve(__dirname, './src/lib/three.js'),
    },
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([
      { from: 'public', to: '../dist/public' },
      { from: 'templates/_redirects', to: '../dist/' },
      { from: 'templates/no-webgl.html', to: '../dist' },
      { from: 'templates/not-available.html', to: '../dist' },
    ]),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
        FLAVOR: JSON.stringify(FLAVOR),
      },
    }),

    // Main page html settings:
    new HtmlWebpackPlugin(
      Object.assign(
        {
          filename: 'index.html',
          template: `templates/${FLAVOR === 'cms' ? 'cms.html' : 'index.ejs'}`,
          twitter: {
            title: content.title,
            description: content.description,
            image: content.image,
          },
          facebook: {
            appId: 305769256550344,
            title: content.title,
            description: content.description,
            image: content.image,
          },
        },
        htmlSettings
      )
    ),

    // Shared performance html settings:
    new HtmlWebpackPlugin(
      Object.assign(
        {
          filename: 'performance.html',
          template: 'templates/index.ejs',
          twitter: {
            title: content.title,
            description: content.sharedDescription,
            image: content.image,
          },
          facebook: {
            appId: 305769256550344,
            title: content.title,
            description: content.sharedDescription,
            image: content.image,
          },
        },
        htmlSettings
      )
    ),

    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'async',
    }),
    new HtmlWebpackInlineSourcePlugin(),
    new webpack.ProvidePlugin({
      THREE: 'THREE',
    }),
    new webpack.NormalModuleReplacementPlugin(
      (/^three$/),
      require.resolve('./src/lib/three')
    ),
    extractSass,
  ],
  devServer: {
    contentBase: './src',
    host: '0.0.0.0',
    port: 3000,
    disableHostCheck: true,
    hot: true,
    overlay: true,
    historyApiFallback: true,
    compress: true,
  },
  context: path.resolve(__dirname, 'src'),
};

if (!isProd) {
  config.plugins.push(
    new webpack.NamedModulesPlugin()
  );
}


if (process.env.ANALYZE_BUNDLE) {
  config.plugins.push(
    new BundleAnalyzerPlugin({
      defaultSizes: 'gzip',
    })
  );
}

module.exports = config;
