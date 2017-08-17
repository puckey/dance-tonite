/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
  description: 'An ever-changing VR collaboration by LCD Soundsystem and their fans.',
  descriptionTwitter: 'An ever-changing VR collaboration by LCD Soundsystem and their fans.',
  descriptionFacebook: 'An ever-changing VR collaboration by LCD Soundsystem and their fans. Produced by Jonathan Puckey, Moniker, and the Google Data Arts Team.',
  sharedDescription: 'Check out my dance in this ever-changing VR collaboration by LCD Soundsystem and their fans.',
  image: 'https://storage.googleapis.com/you-move-me.appspot.com/assets/sharing/share_small.png',
  imageFacebook: 'https://storage.googleapis.com/you-move-me.appspot.com/assets/sharing/share.png',
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
    ? 'source-map'
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
      THREE: path.resolve(__dirname, './third_party/threejs/three.js'),
    },
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([
      { from: 'public', to: '../dist/public' },
      { from: '../third_party/gifworker', to: '../dist/public/third_party/gifworker' },
      { from: 'templates/_redirects', to: '../dist/' },
      { from: 'templates/no-webgl.html', to: '../dist' },
      { from: 'templates/no-webaudio.html', to: '../dist' },
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
            description: content.descriptionTwitter,
            image: content.image,
          },
          facebook: {
            appId: 305769256550344,
            title: content.title,
            description: content.descriptionFacebook,
            image: content.imageFacebook,
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
            image: content.imageFacebook,
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
      require.resolve('./third_party/threejs/three')
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

if (isProd) {
  const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
  config.plugins.push(
    new SWPrecacheWebpackPlugin({
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      minify: true,
      navigateFallback: 'index.html',
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
      runtimeCaching: [{
        urlPattern: /playlist\.json$/,
        handler: 'networkFirst',
      }, {
        urlPattern: /\/recordings\//,
        handler: 'cacheFirst',
        options: {
          cache: {
            maxEntries: 120,
            name: 'recordings',
          },
        },
      }],
    })
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
