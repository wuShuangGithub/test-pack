<template>
    <div>
        1111
        <jsmartWangEditor v-model="content" :isClear="isClear"
                          @change="change" @getJson="getJson"></jsmartWangEditor>
    </div>
</template>

<script>
    import jsmartWangEditor from './jsmart-wangEditor/jsmart-wangEditor1'
    export default {
        name: "pcWangEditor1",
        components: {
            jsmartWangEditor
        },
        data() {
            return {
                content:"aaaaa",
                isClear: false//清除富文本编辑器内容
            }
        },
        methods: {
            change(val) {
                console.log(val, "val 123 val");
            },
            getJson(val) {
                console.log(val, "获取json");
            }
        }
    }
</script>

<style scoped>

</style>