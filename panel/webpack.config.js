/* eslint-disable @typescript-eslint/naming-convention */
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const { getThemeVariables } = require('antd/dist/theme');
// 开发还是生产
const mode = process.env.NODE_ENV;
const isEnvDevelopment = mode === 'development';
const isEnvProduction = mode === 'production';

// 获取绝对地址
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const when = (condition, match = [], noMatch = []) => (condition ? match : noMatch);
const whenDev = (match, noMatch) => when(isEnvDevelopment, match, noMatch);
const whenProd = (match, noMatch) => when(isEnvProduction, match, noMatch);
const paths = {
  appPath: resolveApp('.'),
  appBuild: resolveApp('../build'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('src/index'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appNodeModules: resolveApp('node_modules')
};

const port = 3008;
// common function to get style loaders
const getStyleLoaders = (cssOptions, preProcessor) => {
  const loaders = [
    'style-loader',
    {
      loader: require.resolve('css-loader'),
      options: cssOptions
    },
    ...when(!!preProcessor, [
      {
        loader: 'less-loader',
        options: {
          lessOptions: {
            javascriptEnabled: true,
            modifyVars: getThemeVariables({
            dark: true, // 开启暗黑模式
            })
          }
        }
      }
    ])
  ];
  return loaders;
};

module.exports = {
  // 入口文件
  mode,

  bail: isEnvProduction,
  devtool: isEnvProduction ? false : isEnvDevelopment && 'cheap-module-source-map',
  entry: paths.appIndexJs,
  output: {
    publicPath: '/',
    pathinfo: isEnvDevelopment,
    path: isEnvProduction ? paths.appBuild : undefined,
    filename: isEnvProduction ? 'bundle.js' : '[name].js',
  },

  optimization: {
    minimize: isEnvProduction,
    minimizer: [
      new TerserPlugin({
        parallel: true, //使用多进程并行运行来提高构建速度
        terserOptions: {
          compress: {
            comparisons: false,
            drop_console: false
          },
          output: {
            // Turned on because emoji and regex is not minified properly using default
            ascii_only: true, //
            comments: false // 去掉注释
          },
          mangle: {
            safari10: true
          }
        },
        extractComments: false // 不提取注释，默认true
      }),
      new CssMinimizerPlugin()
    ],
    splitChunks: {
      chunks: 'async',
      name: false
    }
  },

  resolve: {
    // .js非src文件使用
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    plugins: [
      new TsconfigPathsPlugin({
        // tsconfig文件
        configFile: paths.appTsConfig
      })
    ]
  },
  devServer: {
    open: false,
    host: '0.0.0.0', // 本机ip
    port,
    // port: 443,
    // https: true,
    // useLocalIp: true,
    hot: true,
    disableHostCheck: true,
    historyApiFallback: true,
    noInfo: true,
  },
  stats: 'errors-only',
  plugins: [
    new ProgressBarPlugin({}),
    ...whenDev([new FriendlyErrorsWebpackPlugin(), new ReactRefreshWebpackPlugin()]),
    ...whenProd([new CleanWebpackPlugin({})]),
    new HtmlWebpackPlugin({
      template: paths.appHtml,
      inject: true,
    }),
    //  src里里使用process.env.API_ENV
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_ENV': JSON.stringify(process.env.API_ENV)
    }),
    // 忽略moment的本地化文件，入口引入
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new ForkTsCheckerWebpackPlugin({
      async: isEnvDevelopment
    }),
  ],
  module: {
    rules: [
      {
        oneOf: [
          // tsx?文件
          {
            test: /\.[jt]sx?$/,
            include: paths.appSrc,
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                [
                  '@babel/preset-react',
                  {
                    runtime: 'automatic' // babel7自动import React
                  }
                ],
                [
                  '@babel/preset-typescript',
                  {
                    onlyRemoveTypeImports: true
                  }
                ]
              ],

              plugins: [
                [
                  'import',
                  {
                    libraryName: 'antd',
                    libraryDirectory: 'es',
                    style: true
                  }
                ],
                ...whenDev(['react-refresh/babel'])
              ],
              cacheDirectory: true,
              // See #6846 for context on why cacheCompression is disabled
              cacheCompression: false,
              compact: isEnvProduction
            }
          },
          // 图片文件
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10 * 1024,
              name: 'static/media/[name].[hash:8].[ext]'
            }
          },
          // 字体文件
          {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
            use: {
              loader: 'file-loader',
              options: {
                name: 'static/media/[name].[hash:8].[ext]'
              }
            }
          },
          // css
          {
            test: /\.css$/,
            use: getStyleLoaders({
              importLoaders: 1,
              sourceMap: isEnvDevelopment,
              modules: {
                mode: 'local',
                localIdentName: '[name]_[local]_[hash:base64:5]'
              }
            })
          },
          // global里的less不走模块化
          {
            test: /\.global.less$/,
            use: getStyleLoaders(
              {
                importLoaders: 3,
                sourceMap: isEnvDevelopment,
                modules: false
              },
              'less-loader'
            )
          },
          // 普通less
          {
            test: /\.less$/,
            exclude: [/node_modules|antd/],
            use: getStyleLoaders(
              {
                importLoaders: 3,
                sourceMap: isEnvDevelopment,
                modules: {
                  mode: 'local',
                  localIdentName: '[name]_[local]_[hash:base64:5]'
                }
              },
              'less-loader'
            )
          },
          // antd里的less不走模块化
          {
            test: /\.less$/,
            include: [/antd/],
            use: getStyleLoaders(
              {
                importLoaders: 3,
                sourceMap: isEnvDevelopment,
                modules: false
              },
              'less-loader'
            )
          },

          // 其他文件
          {
            loader: 'file-loader',
            exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            options: {
              name: 'static/media/[name].[hash:8].[ext]'
            }
          }
          // stop 已经使用里oneOf,file-loader之后不再使用任何loader
        ]
      }
    ]
  }
};