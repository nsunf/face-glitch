import path from 'path';
const __dirname = path.resolve();

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export default {
  mode: 'development',
  entry: {
    index: './src/scripts/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: ['pug-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-modules-typescript-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.ts$/,
        use: ['ts-loader']
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        use: ['file-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/views/index.pug'),
      filename: 'index.html',
      chunks: 'index'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].style.css'
    })
  ],
  resolve: {
    extensions: ['.ts', '.js', '.css', '.scss', '.sass']
  },
  devServer: {
    port: 3000
  }
}