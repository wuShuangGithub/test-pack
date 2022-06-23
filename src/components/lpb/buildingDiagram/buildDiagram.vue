<template>
    <div class="buildDiagramBox">
        <!--图例-->
        <div class="buildDiagramLegend">
            <slot name="buildLegend"></slot>
        </div>
        <div class="buildDiagramContent" :id="lpbId + 'Content'" :ref="lpbId + 'Content'">
            <!--楼盘表div-->
            <div v-if="flag" style="width: 100%;height: 100%;">
                <div :id="lpbId" class="primary" ref="buildingDiagram"
                     v-loading="pageLoading"
                     element-loading-text="正在加载中">
                </div>
            </div>

            <!--悬浮窗div-->
            <div :id="lpbId + 'Tooltip'" class="tooltip">
            </div>
            <!--操作按钮-->
            <div class="buildDiagramOperate">
                <i class="jsmartFont" @click="onOriginal" title="还原">&#xe62a;</i>
                <i class="jsmartFont" @click="onZoomOut" title="放大">&#xe61a;</i>
                <i class="jsmartFont" @click="onZoomIn" title="缩小">&#xe6d4;</i>
                <i class="jsmartFont" @click="onDownLoad" title="导出图片">&#xe642;</i>
                <i class="jsmartFont" @click="onDownSVG" title="导出SVG">&#xe642;</i>
            </div>
        </div>
    </div>
</template>

<script>
    import {BuildingDiagram} from "./BuildingDiagram.js";
    import './buildingdiagram.css'
    import styleJson from "./style.json";
    export default {
        name: "buildDiagram",
        props: ["lpbId", "lpbData","customTooltips", "onClickLpb",
            "onDblclickLpb","isCustomShowText", "tooltipLists",
            "toolTipsOpacity", "legendConfig", "isCustomRoomG"],
        data() {
            return {
                pageLoading: true,//加载遮罩层
                flag: true, // 楼盘表数据加载出来才显示楼盘表界面
                isShowTip: true,
                buildingDiagram: null, // 楼盘表对象
                editFlag: false, // 是否开启编辑
                dragFlag: false, // 是否开启拖拽
                splitFlag: false, // 是否开启拆分
                mergeFlag: false, // 是否开启合并
                legendColorLists: [], // 图例列表
                scale: 1 // 缩放比例
            }
        },
        created() {
            this.lpbDataDealWidth();
        },
        mounted() {
            window.addEventListener('resize', ()=> {
                // 变化后需要做的事
                this.lpbDataDealWidth();
            });
        },
        methods: {
            // 数据处理
            lpbDataDealWidth() {
                if (this.lpbData && this.lpbData.hasOwnProperty("features") && this.lpbData.features.length) {
                    this.pageLoading = false;
                    this.flag = true;
                    this.$nextTick( () =>{
                        setTimeout( () =>{
                            this.init();
                        },50);

                    });
                } else {
                    this.pageLoading = false;
                }
            },
            // 初始化楼盘表
            init() {
                let defaultTooltipList = [
                    {name: "幢号", value: "zh"},
                    {name: "单元号", value: "dyh"},
                    {name: "房号", value: "fh"},
                    {name: "建筑面积", value: "jzmj"},
                    {name: "楼层", value: "szc"},
                    {name: "地址", value: "fwzl"}
                ]; // 悬浮框提示列表
                this.$refs.buildingDiagram.innerHTML = "";//清除dom
                this.buildingDiagram = new BuildingDiagram({
                    data: this.lpbData,            //json数据
                    styleJson: styleJson,            //json数据
                    targetId: this.lpbId,   //div楼盘表id
                    tooltip: "#" + this.lpbId + 'Tooltip',            //悬浮窗id
                    width: document.getElementById(this.lpbId).offsetWidth,  //宽度
                    height: document.getElementById(this.lpbId).offsetHeight, //高度
                    offsetLeft: document.getElementById(this.lpbId + 'Content').offsetLeft,  // 巨浏览器左边的距离
                    offsetTop: document.getElementById(this.lpbId + 'Content').offsetTop,  // 巨浏览器顶部的距离
                    editFlag: this.editFlag,  //是否开启编辑
                    dragFlag: this.dragFlag,  //是否开启拖拽
                    splitFlag: this.splitFlag,  //是否开启拆分
                    mergeFlag: this.mergeFlag,  //是否开启合并
                    tooltipLists: this.tooltipLists ? this.tooltipLists : defaultTooltipList,  //悬浮窗提示列表
                    legendColorLists: this.legendColorLists,  //图例列表
                    scale: this.scale, // 缩放比例
                    toolTipsOpacity: this.toolTipsOpacity ? this.toolTipsOpacity : 0.9, // 悬浮框提示信息
                    customTooltips: this.customTooltips, // 自定义悬浮框函数
                    onClickLpb: this.onClickLpb, // 鼠标单击函数
                    onDblclickLpb: this.onDblclickLpb, // 鼠标双击函数
                    isCustomShowText: this.isCustomShowText, // 自定义显示文本函数
                    isCustomRoomG: this.isCustomRoomG, // 自定义房间（单元格）内容
                    legendConfig: this.legendConfig // 图例配置
                });
            },
            // 还原
            onOriginal() {
                this.buildingDiagram.reset();
            },
            // 放大
            onZoomOut() {
                this.buildingDiagram.zoomHandler('out');
            },
            // 缩小
            onZoomIn() {
                this.buildingDiagram.zoomHandler('in');
            },
            // 导出图片
            onDownLoad() {
                this.buildingDiagram.exportPNG();
            },
            // 导出svg
            onDownSVG() {
                this.buildingDiagram.exportSVG();
            },

            // 默认的提示悬浮框
            onDefaultTooltips() {

            },
            // 处理楼盘表样式
            updateBuildStyle() {
                this.buildingDiagram.refreshLpTl();
            }
        },
        watch: {
            'lpbData':{
                handler(nl) {
                    if (nl && nl.hasOwnProperty("features") && nl.features.length) {
                        this.pageLoading = false;
                        this.flag = true;
                        this.$nextTick( () =>{
                            this.init();
                        });
                    }
                },
                deep: true
            }
        }
    }
</script>

<style lang="less" scoped>
    .buildDiagramBox{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .buildDiagramLegend{
            /*height: 40px;*/
            flex: none;
            .legendContent{
                display: flex;
                margin-bottom: 10px;
                flex-wrap: wrap;
                .legendItem{
                    padding: 0px 12px;
                    height: 30px;
                    line-height: 26px;
                    cursor: pointer;
                    background: #fff;
                    border: 1px solid #dcdfe6;
                    color: #606266;
                    outline: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 5px;
                }
                .legendItem.active{
                    color: #409eff;
                    border: 1px solid #409eff;
                }
            }
            .legendDetailsContent{
                display: flex;
                margin-bottom: 10px;
                flex-wrap: wrap;
                .legendDetailsItem{
                    padding: 0px 12px;
                    height: 30px;
                    line-height: 26px;
                    cursor: pointer;
                    background: #fff;
                    border: 1px solid #dcdfe6;
                    color: #606266;
                    outline: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin: 2px 5px;
                }
                .legendDetailsItem.active{
                    color: #409eff;
                    border: 1px solid #409eff;
                }
            }
        }
        .buildDiagramContent {
            width: 100%;
            height: 100%;
            flex: 1;
            background: #b9d5ea;
            position: relative;
            #buildingDiagram{
                width: 100%;
                height: 100%;
            }
            .buildDiagramOperate{
                width: 160px;
                height: 30px;
                line-height: 30px;
                position: absolute;
                right: 10px;
                top: 3px;
                background: rgba(21, 45, 76, 0.5);
                color: #fff;
                text-align: right;
                i{
                    padding: 8px;
                    font-size: 16px;
                    cursor: pointer;
                }
            }
        }
    }


</style>
