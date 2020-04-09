const webpack = require('webpack');
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/logger.ts',
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, './dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: '/node_modules',
        use: [{loader: 'ts-loader'}],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(), // 删除build目录
  ],
};
