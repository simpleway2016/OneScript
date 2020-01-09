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
                        outputPath: "imgs/",//��������ǣ�����url����Ϊimgs/**.png
                        name: "[name].[hash:8].[ext]",//8��ʾ��ȡ hash �ĳ���
                        useRelativePath: true//��������� outputPath ���ʹ�òſ��Դ��� css �е������ͼƬ
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "style-loader" // �� JS �ַ�������Ϊ style �ڵ�
                    },
                    {
                        loader: "css-loader" // �� CSS ת���� CommonJS ģ��
                    },
                    {
                        loader: "sass-loader" // �� Sass ����� CSS
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
