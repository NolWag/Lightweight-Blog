const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = [
  {
    entry: [
      'babel-polyfill',
      path.resolve(__dirname, 'app.js')
    ],

    target: 'node',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      publicPath: '/'
    },
    node: {
      __dirname: true,
    },
    mode: 'development',
    devtool: '#source-map',

    module: {
      rules: [
        {
          test: /\.(js)$/,
          loader: 'eslint-loader',
          enforce: 'pre',
          include: [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'test')],
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        },
        {
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ['env']
          }
        },
        {
          test: /\.scss$/,
          use: ["css-loader", "sass-loader"],
        }
      ]
    },

    externals: [nodeExternals()],

    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ]
  }
];
