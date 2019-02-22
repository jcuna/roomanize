/* eslint-disable */
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

module.exports = env => {
    return {
        entry: [
            'webpack/hot/dev-server',
            path.resolve(__dirname, 'js/index.jsx')
        ],
        output: {
            path: path.resolve(__dirname, '/dist'),
            filename: 'bundle.js',
            publicPath: '/dist/'
        },
        resolve: {
            extensions: ['.js', '.jsx', '.css']
        },

        module: {
            rules: [
                {
                    test: /\.jsx?/,
                    exclude: /node_modules/,
                    use: [
                        'babel-loader',
                        'eslint-loader',
                    ]
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: ['eslint-loader']
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader',
                    ],
                },
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: "style.css",
                chunkFilename: "[id].css"
            }),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(env.NODE_ENV)
                }
            }),
        ],
        devServer: {
            contentBase: path.resolve(__dirname),
            hot: true,
            compress: true,
            publicPath: path.resolve(__dirname, '/dist'),
            port: 3000,
            host: '0.0.0.0',
            disableHostCheck: true,
            historyApiFallback: true,
        },
    }
};
