import axios from 'axios'
import router from '@/router/index'
import {Message} from 'element-ui'

let service = axios

//请求发送拦截
service.interceptors.request.use(requestConfig => {
  var tokenAlias = window.localStorage.getItem("tokenAlias")
  var token =  window.localStorage.getItem(tokenAlias?tokenAlias:"tokenAlias");
  let urlEnd = '';
  if (requestConfig.url && requestConfig.url.indexOf('/')>-1){
      urlEnd = requestConfig.url.split('/')[requestConfig.url.split('/').length-1];
  }
  let noToken = requestConfig.headers.noToken ? true : false
  // 登录接口、public接口，noTOken标识接口等不传token
  if (token && token != undefined && urlEnd!='login' && !(requestConfig.url.indexOf('/public/')>-1) && !noToken) {
    requestConfig.headers.XAuthToken = token;
  }
  return requestConfig;
}, error => {
  return Promise.reject(error);
});

//请求结果拦截
let isTokenAlert=false,isErrorAlert=false;  //是否已经弹出过错误，每次多个请求报错只显示一次。token错误弹出后会跳回登录页，登陆后会自动重置标识；error错误需要自己再次重置标识，否则无法再次弹出错误
service.interceptors.response.use(
  response => {
    if (response.data.code=='no_login'){ //具体的判断token失效的参数
      if (!isTokenAlert){
        isTokenAlert=true;
        Message.error(response.data.message);
      }
        var tokenAlias = window.localStorage.getItem("tokenAlias")
        window.localStorage.removeItem(tokenAlias);
        window.localStorage.removeItem("tokenAlias")
        router.push({path: '/'}); //需求方要求一旦出错立即跳转登录，所以采取这种侵入式的手段。
    } else if (response.data.code =='REDIRECT') {  //地址重定向
      // isTokenAlert=false;
      // 如果是cas单点登录，则单独处理
      if (response.request.responseURL.indexOf('/public/loginCasJasig')>-1){
          return response
      } else {
          window.location.href= response.data.redirectUrl
      }
    } else if (response.data.code =='logout') {   //登出
        window.location.href=location.origin + location.pathname + '/#/'
        var tokenAlias = window.localStorage.getItem("tokenAlias")
        window.localStorage.removeItem(tokenAlias);
        window.localStorage.removeItem("tokenAlias")
    } else if (response.data.code=='login_failure'){  //登陆失败
        Message.error(response.data.message);
    } else {
      // 判断接口code为9时弹出错误消息
      try{
        if (response.data && response.data.code == 9 && response.data.message){
          Message.error(response.data.message);
        }
      }catch (e) {
        console.log(e);
      }
      isTokenAlert=false;
      return response
    }
      setTimeout(function(){
          isTokenAlert=false;
      },1000)  //恢复是为了再次刷新时可以再次报错
  },
  error => {
    // if (!isErrorAlert){
    //   isErrorAlert=true;
    //   status非200进入这里
      let message = '';
      if (error && error.response) {
        switch (error.response.status) {
          case 400:
            message = '错误请求！'
            break;
          case 401:
            message = '未授权，请重新登录！'
            break;
          case 403:
            message = '拒绝访问！'
            break;
          case 404:
            message = '请求错误,未找到该资源！'
            break;
          case 405:
            message = '请求方法未允许！'
            break;
          case 408:
            message = '请求超时！'
            break;
          case 500:
            var obj = JSON.parse(JSON.stringify(error.response.data))
            if (obj.message != undefined){
              message = obj.message
            } else {
              message = '网络或服务器端错误！'
              if (obj.byteLength > 0) {
                var fileData = new Uint8Array(obj)
                var e = Utf8ArrayToStr(fileData);
                var result = JSON.parse(e)
                message = result.message
              }
            }
            break;
          case 501:
            message = '网络未实现！'
            break;
          case 502:
            message = '网络错误！'
            break;
          case 503:
            message = '服务不可用！'
            break;
          case 504:
            message = '网络超时！'
            break;
          case 505:
            message = 'http版本不支持该请求！'
            break;
          default:
              var obj = JSON.parse(JSON.stringify(error.response.data))
              if (obj.message != undefined){
                  message = obj.message
              } else {
                  message = `连接错误${error.response.status}`
              }
        }
      } else {
        message = "连接到服务器失败！"
      }
      Message.error(message)
    // }
    // setTimeout(function(){
    //   isErrorAlert=false;
    // },1000)  //恢复是为了再次刷新时可以再次报错
    return Promise.reject(error)
  })


function Utf8ArrayToStr(array) {
  var out, i, len, c;
  var char2, char3;

  out = "";
  len = array.length;
  i = 0;
  while (i < len) {
    c = array[i++];
    switch (c >> 4) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12:
      case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
            ((char2 & 0x3F) << 6) |
            ((char3 & 0x3F) << 0));
        break;
    }
  }
  return out;
}

export default service
