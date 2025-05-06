const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Determine public path based on build mode
const isProduction = process.env.NODE_ENV === 'production';
// <<< CHANGE THIS REPO NAME IF NEEDED >>>
const repoName = 'ToDoWeb'; // <--- REPLACE THIS WITH YOUR GITHUB REPO NAME
const publicPath = isProduction ? `/${repoName}/` : '/';

module.exports = {
  mode: isProduction ? 'production' : 'development', // Set mode based on environment
  entry: Object.fromEntries(Object.entries({
    main: './src/index.js',
    runtime: isProduction ? undefined : 'webpack-dev-server/client/index.js?hot=true&live-reload=true',
  }).filter(([_, v]) => v !== undefined)),
  devtool: isProduction ? 'source-map' : 'inline-source-map', // Adjust devtool for prod/dev
  devServer: {
    static: './dist',
    hot: true, // Enable Hot Module Replacement
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template.html', // Use our template
      title: 'Todo List App', // Title used in template
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: publicPath, // Set public path for correct asset loading
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'], // Load CSS files
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource', // Handle image assets
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource', // Handle font assets
      },
    ],
  },
  optimization: {
    runtimeChunk: 'single', // Separate runtime chunk is beneficial, especially with HMR
  },
};
