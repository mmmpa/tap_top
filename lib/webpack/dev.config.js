module.exports = {
  entry: './js/index',
  output: {
    path: '../assets',
    publicPath: 'js',
    filename: 'built.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
};