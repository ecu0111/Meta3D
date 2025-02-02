const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


process.env.NODE_ENV = "development";
// process.env.NODE_ENV = "production";

const isProd = process.env.NODE_ENV.trim() == 'production';
const isDevelopment = !isProd;

module.exports = {
    entry: "./lib/es6_global/src/Main.bs.js",
    mode: isProd ? 'production' : 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'static/js/[name].js',
    },


    devServer: {
        compress: true,
        historyApiFallback: true,
        port: 8090
    },

    // Enable sourcemaps for debugging webpack's output.
    // devtool: "source-map",

    resolve: {
        // extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
        extensions: ['.js', '.jsx', '.css'],
        modules: ['node_modules'],
        fallback: { "crypto": false }

    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            // {
            //     test: /\.tsx?$/,
            //     // exclude: /node_modules/,
            //     use: "awesome-typescript-loader"
            // },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            // {
            //     enforce: 'pre',
            //     test: /\.js$/,
            //     loader: "source-map-loader"
            // },
            // {
            //     test: /\.module\.s(a|c)ss$/,
            //     exclude: /node_modules/,
            //     loader: [
            //         isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            //         {
            //             loader: 'css-loader',
            //             options: {
            //                 modules: true,
            //                 sourceMap: isDevelopment
            //             }
            //         },
            //         {
            //             loader: 'sass-loader',
            //             options: {
            //                 sourceMap: isDevelopment
            //             }
            //         }
            //     ]
            // },
            // {
            //     test: /\.s(a|c)ss$/,
            //     exclude: /\.module.(s(a|c)ss)$/,
            //     loader: [
            //         isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            //         'css-loader',
            //         {
            //             loader: 'sass-loader',
            //             options: {
            //                 sourceMap: isDevelopment
            //             }
            //         }
            //     ]
            // },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'] //在Webpack中，loader的执行顺序是从右向左执行的，webpack先将所有css模块依赖解析完得到计算结果再创建style标签。因此把style-loader放在css-loader的前面。
            }
        ]
    },
    plugins: [
        /**
        * All files inside webpack's output.path directory will be removed once, but the
        * directory itself will not be. If using webpack 4+'s default configuration,
        * everything under <PROJECT_DIR>/dist/ will be removed.
        * Use cleanOnceBeforeBuildPatterns to override this behavior.
        *
        * During rebuilds, all webpack assets that are not used anymore
        * will be removed automatically.
        *
        * See `Options and Defaults` for information
        */
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].[hash].css',
        }),
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: 'index.html',
        }),
    ],
    // // When importing a module whose path matches one of the following, just
    // // assume a corresponding global variable exists and use that instead.
    // // This is important because it allows us to avoid bundling all of our
    // // dependencies, which allows browsers to cache those libraries between builds.
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDOM"
    // }
};