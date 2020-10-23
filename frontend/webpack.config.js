const path = require('path')


module.exports = {
  
  target: 'web',
  //externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
            test: /\.css$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 1,
                  modules: true
                }
              }
            ],
            include: /\.module\.css$/
          },
          {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader'
            ],
            exclude: /\.module\.css$/
          },
          {
            test: /\.json/i,
            type: 'javascript/auto',
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[name].[ext]',
                },
              },
            ],
          }
      ]
    },
    output: {
        path: path.resolve(__dirname, 'static/frontend'),
        publicPath: '/public/',
        filename: 'bundle.js',
    },
  };