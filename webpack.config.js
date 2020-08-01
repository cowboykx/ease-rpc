const merge = require('webpack-merge');
const path = require('path');

const projectRoot = path.join(__dirname, '.');

const baseConfig = {
  mode: 'production',
  output: {
    path: projectRoot,
  },
  optimization: {
    minimize: false
  },
  cache: true
};

const webConfig = {
  entry: {
    'index': './src/index.ts'
  },
  output: {
    filename: './lib/[name].js',
    library: 'EaseRPC',
    libraryTarget: 'umd',
  },
  target: 'web',
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.(ts)?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: path.resolve(__dirname, './tsconfig.json')
        }
      },
      {
        test: /\.less|\.css$/,
        loader: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  },
  plugins: [],
  externals: {
  }
};

module.exports = [
  merge(baseConfig, webConfig)
]
