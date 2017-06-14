var path = require('path');
var glob = require("glob");
var testsPattern = path.join(__dirname, 'dist', 'test', '**', '*.spec.js');

module.exports = {
    context: __dirname,
    devtool: 'eval',
    entry: {
        'test' : glob.sync(testsPattern),
        'webtest' : ['mocha!'+ testsPattern]
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
        hot: true
    },
    module: {
        loaders: [],
        noParse: [/\.min\.js$/, /\.bundle\.js$/]
    }
};
