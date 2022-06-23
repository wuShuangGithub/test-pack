import Vue from 'vue'
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import globalAxios from '../public/axios/axios'
// 初始化多环境 API_PREFIX与STATIC_PREFIX
let PROFILES = require('../config/env/profiles')
PROFILES.initEnvProfilesConfig(Vue);

Vue.use(ElementUI)
Vue.config.productionTip = false

globalAxios();
new Vue({
  render: h => h(App),
}).$mount('#app')
