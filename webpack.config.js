var path = require('path');

module.exports = {
    context: __dirname,
    devtool: 'eval',
    entry: {
        'test' : path.join(__dirname, 'dist', 'test', 'all-specs.js'),
        'webtest' : ['mocha!'+ path.join(__dirname, 'dist', 'test', 'all-specs.js')]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js',
        libraryTarget: 'umd',
        pathinfo: true
    },
    resolve: {
        alias: {
            mutable2: path.join(__dirname, 'dist', 'src')
        }
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        inline: true,
        hot: false
    },
    module: {
        loaders: [],
        noParse: [/\.min\.js$/, /\.bundle\.js$/]
    }
};
