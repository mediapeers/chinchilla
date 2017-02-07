module.exports = {
  entry: './lib/browser.ts',
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
