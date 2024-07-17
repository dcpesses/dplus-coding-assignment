const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './src/script.js',
    reordered: './src/script-reordered.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['main'],
      minify: {
        removeComments: false,
      },
      template: './src/index.html',
    }),
    new HtmlWebpackPlugin({
      chunks: ['reordered'],
      filename: 'reorder.html',
      minify: {
        removeComments: false,
      },
      template: './src/reorder.html',
    }),
  ],
  devServer: {
    static: './dist',
    hot: true,
  },
};
