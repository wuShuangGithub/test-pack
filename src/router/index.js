import Vue from 'vue'
import VueRouter from 'vue-router'

//解决路由重定向错误问题
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
    return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

let routes = [];
if (process.env.NODE_MODULE_NAME == 'devcenter') {

} else {

}

const router = new VueRouter({
    base: process.env.BASE_URL,
    routes
})

export default router
