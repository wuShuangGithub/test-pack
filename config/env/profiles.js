const API_PREFIXE = {
    // 开发环境（新增参数后记得添加服务器代理地址）
    dev: {
        PLATFORM: '/platform',
        WORKFLOW: '/workflow',
        ORGANIZATION: '/organization',
        PORTAL: '/portal',
        DEVCENTER:'/devcenter/',
        LCTEST: '/lctest/',
        FWZL: '/fwzlapi/',
        GIS:'/gis/'
    },
    // 生产环境
    production: {
        PLATFORM: '/jsmart/',
        WORKFLOW: '/jsmart/',
        ORGANIZATION: '/jsmart/',
        PORTAL: '/jsmart/',
        DEVCENTER:'/jsmart/devcenter/',
        LCTEST: '/lctest/',
        FWZL: '/fwzlapi/',
        GIS:'/gis/'
    },
    // 测试环境
    test: {
        PLATFORM: '/jsmart/',
        WORKFLOW: '/jsmart/',
        ORGANIZATION: '/jsmart/',
        PORTAL: '/jsmart/',
        DEVCENTER:'/jsmart/',
        LCTEST: '/lctest/',
        FWZL: '/fwzlapi/',
        GIS:'/gis/'
    }
}

// 定义开发环境服务器代理地址（只有开发环境有代理地址）
const serverProxyPath ={
    PLATFORM: 'http://192.168.100.159:8080/jsmart/',
    WORKFLOW: 'http://192.168.100.159:8080/jsmart/',
    ORGANIZATION: 'http://192.168.100.159:8080/jsmart/',
    PORTAL: 'http://192.168.100.159:8080/jsmart/',
    DEVCENTER:'http://192.168.100.159:8080/jsmart/devcenter/',
    // DEVCENTER:'http://192.168.1.147:8081/devcenter/',
    LCTEST: 'http://192.168.100.159:3000/mock/12/jsmart/',
    FWZL: 'http://192.168.1.185:8086',
    GIS:'http://172.17.10.218:8081/jsmart/'

    // PLATFORM: 'http://192.168.100.159:8080/jsmart/',
    // WORKFLOW: 'http://192.168.100.159:8080/jsmart/',
    // ORGANIZATION: 'http://192.168.100.159:8080/jsmart/',
    // PORTAL: 'http://192.168.100.159:8080/jsmart/',
    // DEVCENTER:'http://192.168.100.159:8080/jsmart/devcenter/',
    // LCTEST: 'http://192.168.100.159:3000/mock/12/jsmart/',
    // FWZL: 'http://192.168.1.185:8086',
    // GIS:'http://172.17.10.218:8081/jsmart/'
}

// static路径
const STATIC_PREFIXE = {
    STATIC: "./static",
    IMGAGE: "/static/images",
    STYLE: "/static/style"
}

function initEnvProfilesConfig(Vue) {
    /**
     * 环境服务配置 放入widnows.简化项目 调用
     * @scope 在任何js.和vue文件可用v
     * @example   API_PREFIX.PLATFORM
     */
    window["API_PREFIX"] = API_PREFIXE[process.env.NODE_ENV];
    window["STATIC_PREFIX"] = STATIC_PREFIXE;
    /**
     * STATIC路径 放入VUE全局，
     * @example
     *   this.$STATIC_PREFIX.STATIC
     */
    Vue.prototype['$STATIC_PREFIX'] = STATIC_PREFIXE;
}

let PROFILES={
    API_PREFIX:API_PREFIXE[process.env.NODE_ENV],
    serverProxyPath,
    initEnvProfilesConfig
}
module.exports=PROFILES;
