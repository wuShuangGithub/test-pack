<template>
    <div>测试低版本浏览器兼容性问题</div>
</template>

<script>
    import LOGIN_API from './api/login_api'
    export default {
        name: "login",
        created() {
            this.testPromise();
            console.log(11111111111111111111);
            console.log(11111111111111111);

        },
        methods:{

            testPromise() {
                new Promise((resolve, reject) => {
                    // 获取菜单权限
                    LOGIN_API.getMainMenu({
                        roleCodes:[],
                        systemCodeList: ["JSMART"]
                    }).then( res =>{
                        console.log(res, "获取菜单数据");
                        if (res.data.code == 0) {
                            resolve(res.data.data);
                        } else {
                            reject()
                        }
                    });
                    LOGIN_API.getpicture({
                        "num": "2"
                    }).then(res =>{
                        console.log(res, "getpicture");
                    });

                });
            }
        }
    }
</script>

<style scoped>

</style>