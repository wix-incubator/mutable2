var path = require('path');
var glob = require("glob");

const specs = glob.sync("./dist/test/**/*.spec.js").filter(function (s) {
    return !~s.indexOf('nodejs');
});

function tests(prefix){
     return [path.join(__dirname, 'dist', 'test', 'setup.js')].concat(specs.map(function (s) {return prefix + s;}))
}
module.exports = {
    context: __dirname,
    devtool: 'eval',
    entry: {
        'test' : tests(''),
        'webtest' : tests('mocha!')
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js',
        libraryTarget: 'umd',
        pathinfo: true
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
