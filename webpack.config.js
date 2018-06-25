module.exports = {
  entry: [
    'core-js/fn/object/assign',
    './src/es5.pack.ts',
    ],
  output: {
    path: __dirname + '/dist',
    filename: 'chinchilla.es5.pack.js'
  },
  resolve : {
    extensions: ['.js', '.ts']
  },
  node: {
    fs: 'empty'
  },
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts-loader', options: { configFileName: 'tsconfig.es5.json' } }
    ]
  }
}
