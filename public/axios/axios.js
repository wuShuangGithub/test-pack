import request from './request'
import qs from 'qs'
import comUtils from '@utils/comUtils.js'
// 定义请求函数
let AXIOS = {
    get:async (url = '', data, config = {}) => {
        return request({
            ...config,
            url: url,
            method: 'get',
            data: data
        })
    },
    post:async (url = '', data, config = {}) => {
        return request({
            ...config,
            url: url,
            method: 'post',
            data: data
        })
    },
    getByQs:async function (url = '', data, config = {}) {
        return AXIOS.get(url, qs.stringify(data), config);
    },
    postByQs:async function (url = '', data, config = {}) {
        return AXIOS.post(url, qs.stringify(data), config);
    },
    postDataAndPageByQs:async function (url = '', data,page, config = {}) {
        return AXIOS.post(url, qs.stringify(data) + "&" + qs.stringify(page), config);
    },
    downloadByGet: async (url = '', data, name, config = {responseType: 'arraybuffer'}) => {
         request({
            ...config,
            url: url,
            method: 'get',
            data: data
        }).then( res =>{
             comUtils.outputExcelFile(res, name);
        });
    },
    downloadByPost: async (url = '', data, name, config = {responseType: 'arraybuffer'}) => {
        request({
            ...config,
            url: url,
            method: 'post',
            data: data
        }).then( res =>{
            comUtils.outputExcelFile(res, name);
        });
    }
}

// 创建全局请求函数
function globalAxios() {
    window['AXIOS'] = AXIOS;
}

export default globalAxios;