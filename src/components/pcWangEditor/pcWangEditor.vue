<template>
    <div class="content">
        <h1>WangEditor样例</h1>
        <wang-editor @editorContent="getEditorContent" />
        <div class="show">
        <h3>内容预览</h3>
        <textarea name="" cols="170" rows="20" readonly style="width: 100%" v-model="editorData"></textarea>
        </div>
    </div>
</template>

<script>
    // 引入子组件
    import WangEditor from "./jsmart-wangEditor/jsmart-wangEditor";
    export default {
        name: "app",
        components: {
            WangEditor
        },
        data() {
            return {
                // 编辑器内容
                content: "",
                editorData: ""
            };
        },
        methods: {
            // 获取编辑器内容
            getEditorContent(data) {
                //将获取的Html转成纯文本
                this.editorData = data.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi,'').replace(/<[^>]+?>/g,'').replace(/\s+/g,' ').replace(/ /g,' ').replace(/>/g,' ');
            }
        }
    };

</script>

<style lang="scss" scoped>
    .content {
        width: 100%;
    }
    .show {
        width: 80%;
        margin: 0 auto;
    }
    h3 {
        margin: 30px 0 15px;
    }

</style>