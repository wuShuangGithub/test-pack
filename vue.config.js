let serverProxyConfig = require('./config/serverProxyConfig.js')
const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')

let plugins = [];
// 判断是否为生产环境，如果是的话，移除console和debugger
process.env.NODE_ENV === 'production' ? plugins.push(new TerserPlugin({
    cache: true,// 降低版本号后增加
    sourceMap: false,//降低版本号后增加
    // 多进程
    parallel: true,//降低版本号后增加
    terserOptions: {
        ecma: undefined,
        warnings: false,
        parse: {},
        compress: {
            drop_console: true, // 生产环境移除控制台的console
            drop_debugger: true, // 生产环境移除debugger
            pure_funcs: ['console.log'], // 移除console
        },
    },
})) : plugins

function resolve(dir) {
    return path.join(__dirname, dir)
}
module.exports = {
    //部署应用包时的基本 URL
    publicPath: './',
    // 将构建好的文件输出到哪里（或者说将编译的文件）
    outputDir: 'aabb',
    // 是否在保存的时候使用 `eslint-loader` 进行检查。
    // 有效的值：`ture` | `false` | `"error"`
    // 当设置为 `"error"` 时，检查出的错误会触发编译失败。
    lintOnSave: false,
    // babel-loader 默认会跳过 node_modules 依赖。
    // 通过这个选项可以显式转译一个依赖。
    /**
     * node_modules里的依赖默认是不会编译的,会导致es6语法在ie中的语法报错,
     * 所以需要在vue.config.js中使用transpileDependencies属性配置node_modules中指定哪些文件夹或文件需要编译.
     * */
    /**
     * 编译node_modules中的文件 将es6转换成es5
     * transpileDependencies值可以是 string or regex
     * */
    transpileDependencies: [],
    // 是否为生产环境构建生成 source map？
    productionSourceMap: true,
    // webpack-dev-server 相关配置
    devServer: {
        hot: true, //热加载
        host: '0.0.0.0', //ip地址
        port: 8082, //端口
        https: false, //false关闭https，true为开启
        open: true, //自动打开浏览器
        proxy: serverProxyConfig //配置多个跨域
    },
    //模块路径别名配置。
    chainWebpack: (config) => {
        /**
         * 配置目录别名
         * */
        config.resolve.alias
            .set('@', resolve('src'))
            .set('@static', resolve('public/static'))
        /**
         * 通过externals加载外部CDN资源
         * 默认情况下，通过import语法导入的第三方依赖包，最终会被打包并到同一个文件中，
         * 从而导致打包成功后，单文件体积过大的问题。
         * 通过webpack的externals节点，来配置并加载外部的CDN资源。
         * 凡是声明在externals中的第三方依赖包，都不会被打包
         * */
        config.externals({'$': "$",'d3':'d3', 'ol':'ol'})
    },
    configureWebpack:{
        plugins: plugins
    },
    css: {
    },
    // 更换浏览器图标
    pwa: {
        iconPaths: {
            favicon32: 'favicon.ico',
            favicon16: 'favicon.ico',
            appleTouchIcon: 'favicon.ico',
            maskIcon: 'favicon.ico',
            msTileImage: 'favicon.ico'
        }
    }
};