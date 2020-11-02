const path = require('path');

module.exports = {
    entry: "./assets/js/search/kdh.js",
    output: {
        path: path.resolve(__dirname, "public/js/search"), //文件夹
        filename: "kdh.js"
    },
    module: {
        rules: [{
            "test": /\.js$/,
            "exclude": /(node_modules)/,
            "use": [{
                "loader": "babel-loader",
                options: {
                    presets: ['es2015']
                }
            }]
        }]
    },
    watch: true,
    mode: 'development'
}