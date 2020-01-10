const path = require('path');

module.exports = {
    entry: './test/main.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                use: {
                    loader: 'jack-html-loader',
                    options: {
                        attrs: ["img:src", "image:xlink:href"]
                    }
                },
            },

            {
                test: /\.(jpg|png|svg|gif|jpeg|otf|ttf)$/,
                use: {
                    loader: "file-loader",
                    options: {
                        outputPath: "imgs/",//定义这个是，最终url解析为imgs/**.png
                        name: "[name].[hash:8].[ext]",//8表示截取 hash 的长度
                        useRelativePath: true//这个必须与 outputPath 结合使用才可以处理 css 中的引入的图片
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "style-loader" // 将 JS 字符串生成为 style 节点
                    },
                    {
                        loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
                    },
                    {
                        loader: "sass-loader" // 将 Sass 编译成 CSS
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    watch: true,
    output: {
        path: __dirname + "/test/dist",
        filename: './bundle.js'
    }
};
