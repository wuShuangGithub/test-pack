<template>
    <div style="display: flex;">
        <div id="div1" class="toolbar">
        </div>
        <div id="div2" class="text"> <!--可使用 min-height 实现编辑区域自动增加高度-->
            <p>请输入内容</p>
        </div>
    </div>
</template>

<script>
    import E from "wangeditor"
    export default {
        name: "jsmart-wangEditor2",
        mounted() {
            var editor1 = new E('#div1', '#div2')  // 两个参数也可以传入 elem 对象，class 选择器
            editor1.create()
        }
    }
</script>

<style scoped>
    .toolbar {
        width: 50px;
        margin-right: 5px;
        border: 1px solid #ccc;
    }
    .text {
        flex: 1;
        border: 1px solid #ccc;

    }
</style>