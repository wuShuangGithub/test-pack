/**
 * 代理配置文件.
 * 此文件修改需要重启.
 */
let PROFILES = require('./env/profiles')
// 服务器代理配置
let ServerProxyConfig = {};

let PATHREWRITE = {}; //路径重写
for (let key in PROFILES.API_PREFIX){
    // 配置路径重写为''
    PATHREWRITE[PROFILES.API_PREFIX[key]]={};
    PATHREWRITE[PROFILES.API_PREFIX[key]]['^' + PROFILES.API_PREFIX[key]]='';
    // 配置代理地址
    ServerProxyConfig[PROFILES.API_PREFIX[key]] = {
        target:PROFILES.serverProxyPath[key],
        changeOrigin: true,
        pathRewrite: PATHREWRITE[PROFILES.API_PREFIX[key]]
    }
}

module.exports = ServerProxyConfig;
