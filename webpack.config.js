
var path = require('path')
var webpack = require('webpack')

module.exports = {
  target: 'atom',
  entry: {
    app: './app/app.js',
  },
  plugins: [
    new webpack.IgnorePlugin(/vertx/),
  ],
  output: {
    path: './build',
    filename: '[name].js',
  },
   node: {
    console: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  module: {
    loaders: [
      {
        test: /\.json/,
        loader: "json-loader"
      },
      {
        test: /\.vue/,
        loader: 'vue'
      },
      {
        test: /\.js/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
    ]
  }
}
