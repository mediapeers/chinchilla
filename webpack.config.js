var nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/browser.ts',
  externals: [nodeExternals()],
  output: {
    path: __dirname + '/dist',
    filename: 'chinchilla.js'
  },
  resolve : {
    extensions: ['.js', '.ts']
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
}
