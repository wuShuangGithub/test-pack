<template>
    <div class="home">
        <div id="demo1"></div>
        <button type="button" class="btn" @click="getEditorData">获取当前内容</button>
    </div>

</template>

<script>
    // 引入 pcWangEditor
    import wangEditor from "wangeditor";
    export default {
        name: "jsmart-wangEditor",
        data() {
            return {
                editor: null,
                editorData: "",
            };
        },

        mounted() {
            const editor = new wangEditor(`#demo1`);
            // 配置 onchange 回调函数，将数据同步到 vue 中
            editor.config.onchange = (newHtml) => {
                this.editorData = newHtml;
                this.$emit("editorContent", newHtml);
            };
            console.log(editor, "editor");
            editor.config.showLinkImg = false;
            // 创建编辑器
            editor.create();
            this.editor = editor;
        },

        methods: {
            getEditorData() {
                // 通过代码获取编辑器内容
                let data = this.editor.txt.html();
                alert(data);
            }
        },
        beforeDestroy() {
            // 调用销毁 API 对当前编辑器实例进行销毁
            this.editor.destroy();
            this.editor = null;
        },

    };
</script>

<style lang="less" scoped>
    .home {
        width: 1200px;
        margin: auto;
    }
</style>