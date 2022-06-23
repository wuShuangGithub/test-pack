let LOGIN_API={
    // 获取菜单
    getMainMenu:function(data){
        return AXIOS.post(API_PREFIX.PORTAL + '/mainmenu/getMainMenu',data);
    },
   getpicture:function(data){
        return AXIOS.post("http://192.168.100.92:3000/mock/12/Getpicture",data);
    }
}

export default LOGIN_API;