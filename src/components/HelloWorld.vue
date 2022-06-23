<template>
    <div >
        <!--<login></login>-->
        <!--<lpb></lpb>-->
        <eagleEyeDiagram></eagleEyeDiagram>
        <!--<pcWangEditor></pcWangEditor>-->
        <!--<pcWangEditor1></pcWangEditor1>-->
        <!--<jsmartWangEditor2></jsmartWangEditor2>-->
    </div>
</template>

<script>
    import login from '../views/login/login'
    import lpb from "./lpb/lpb"
    import eagleEyeDiagram from "./eagleEyeDiagram/eagleEyeDiagram" // d3 鹰眼图
    import pcWangEditor from "./pcWangEditor/pcWangEditor"
    import pcWangEditor1 from "./pcWangEditor/pcWangEditor1"
    import jsmartWangEditor2 from "./pcWangEditor/jsmart-wangEditor/jsmart-wangEditor2"
    export default {
        name: 'HelloWorld',
        props: {
            msg: String
        },
        components: {
            // login,
            // lpb,
            eagleEyeDiagram,
            // pcWangEditor,
            // pcWangEditor1,
            // jsmartWangEditor2
        },
        created() {
            console.log("测试console.log打印打包之后是否删除", "123123213");
            let obj = {properties: { ext: { fwxz: "123"}}}, filed = "ext.fwxz"
            console.log(this.getDeepValue(obj, filed), "this.getDeepValue(d.properties, \"FWXZ\")");
        },
        methods: {
            getDeepValue(obj, path) {
                if (typeof path === "string") {
                    var path = path.split('.');
                }
                if (path.length > 1) {
                    var p = path.shift();
                    if (obj[p] == null || typeof obj[p] !== 'object') {
                        obj[p] = {};
                    }
                    return this.getDeepValue(obj[p], path);
                } else {
                    return obj[path[0]];
                }
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
    .hello{
        .abc{
            border: 1px solid green;
        }
    }
</style>
