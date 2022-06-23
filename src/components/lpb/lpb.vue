<template>
    <div class="lpbBox">
        <div class="buildDiagramTest">
            <!--调用楼盘表组件-->
            <buildDiagram v-if="isShow" :lpbData="lpbData2" :lpbId="'buildDiagram1'"
                          :toolTipsOpacity="toolTipsOpacity"
                          :legendConfig="legendConfig"
                          ref="buildDiagram1"
                          :onClickLpb="onClickLpb"
                          :onDblclickLpb="onDblclickLpb"
                          :isCustomShowText="isCustomShowText"
            >
                <!--自定义图例区域 可根据不同业务情况自行定义图例-->
                <template v-slot:buildLegend>
                    <div class="legendContent">
                        <span style="height: 32px;line-height: 32px;display: inline-block;">自然幢Id:</span>
                        <el-input v-model="zrzid" size="small" placeholder="请输入自然幢Id" style="width: 110px;"></el-input>
                        <span style="height: 32px;line-height: 32px;display: inline-block;">标准宽度:</span>
                        <el-input v-model="standardWidthHouse" size="small" placeholder="请输入标准宽度"
                                  style="width: 110px;"></el-input>
                        <span style="height: 32px;line-height: 32px;display: inline-block;">标准高度:</span>
                        <el-input v-model="standardHeightHouse" size="small" placeholder="请输入标准高度"
                                  style="width: 110px;"></el-input>
                        <span style="height: 32px;line-height: 32px;display: inline-block;">最大房屋数:</span>
                        <el-input v-model="maxNum" size="small" placeholder="请输入最大房屋数" style="width: 110px;"></el-input>
                        <el-button size="small" @click="getLpbData()">查询</el-button>
                    </div>
                    <div class="legendContent">
                        <div class="legendItem" v-for="(item, index) in legendList"
                             :key="index" :class="{active: activeIndex == index }"
                             @click="onClickLegend(item, index)">{{item.name}}
                        </div>
                    </div>
                    <div class="legendDetailsContent">
                        <div class="legendDetailsItem" v-for="(item, index) in legendDetailsList"
                             :key="index" :style="{background: item.color, color: '#fff'}">
                            <i class="jsmartFont" v-html="item.icon" :style="{color: item.icon ? item.icon : ''}"></i>
                            <span>{{item.text}}</span>
                        </div>
                    </div>
                </template>
            </buildDiagram>
        </div>
    </div>
</template>

<script>
    import buildDiagram from './buildingDiagram/buildDiagram'
    import dataJson from "./data.json";
    import imgBase64 from "./buildingDiagram/imgBase64"
    export default {
        name: 'lpb',
        components: {
            buildDiagram
        },
        data() {
            return {
                isShow: false,
                zrzid: '80007843', // 自然幢ID
                standardWidthHouse: 80, // 标准宽度
                standardHeightHouse: 80, // 标准高度
                maxNum: '', // 最大房屋数
                legendDetailsList: [], // 图例详情列表
                legendConfig: { // 优先级 customView > lengDictIndex > lengDictData > legendDictCode
                    field: "", // 图例字段
                    legendDictCode: "", // 图例字典编码
                    legendDictData: [], // 图例字典数据
                    legendDictIndex: {}, // 图例字典索引
                    customLpbLegendFunc: null  // 自定义楼盘表图例函数
                    // customLpbLegendFunc:function (d,roomDOM){ // 自定义楼盘表图例函数 d每一个房间号数据roomDOM所有房间DOM
                    //
                    // }
                }, // 图例配置数据
                activeIndex: null, // 图例激活的索引值
                legendList: [
                    {
                        filed: "code",
                        code: 'FWYT',
                        name: '房屋用途'
                    },
                    {
                        filed: "dyh",
                        code: 'FWXZ',
                        name: '房屋性质'
                    }
                ], // 图例
                lpbData: {}, // 楼盘表json数据
                lpbData2: {},
                toolTipsOpacity: 0.9, // 悬浮框透明度
                tooltipLists: [
                    {name: "幢号", value: "block"},
                    {name: "单元号", value: "unitName"},
                    {name: "房号", value: "fh"},
                    {name: "建筑面积", value: "jzmj"},
                    {name: "楼层", value: "szc"},
                    {name: "地址", value: "located"}
                ] // 悬浮框自定义列表
            }
        },
        created() {
            // 获取楼盘表数据
            if (dataJson.code == 0) {
                this.lpbData2 = dataJson.data;
                this.isShow = true;
            }
        },
        methods: {
            // 查询
            getLpbData() {

            },
            // 点击图例
            onClickLegend(item, index) {
                this.activeIndex = index;
                if (index == 0) { // 通过房屋用途 code: 'FWYT'获取数据赋值给legendDetailsList，这里我只写死的，没条用数据字典
                    this.legendDetailsList = [
                        {
                            text: "商铺",
                            value: "10495324",
                            color: "blue"
                        },
                        {
                            text: "物业用房",
                            value: "10495309",
                            color: "green"
                        }
                    ];
                } else { // 通过房屋用途 code: 'FWXZ'获取数据赋值给legendDetailsList，这里我只写死的，没条用数据字典
                    this.legendDetailsList = [
                        {
                            text: "商品房",
                            value: "1",
                            color: "red"
                        },
                        {
                            text: "其他",
                            value: "2",
                            color: "#28F2D1"
                        }
                    ];
                }
                this.legendConfig.legendDictData = this.legendDetailsList; // 数据字典 数据

                this.legendConfig.field = item.filed;


                this.$nextTick(() => {
                    this.$refs.buildDiagram1.init();
                    // this.$refs.buildDiagram1.updateBuildStyle(item.filed);
                    this.$refs.buildDiagram1.updateBuildStyle();
                });
            },
            // 单击楼盘表
            onClickLpb(d) {
                console.log(d, "鼠标单击 1234");
            },
            // 双击楼盘表
            onDblclickLpb(d) {
                console.log(d, "鼠标双击 1234");
            },
            // 自定义悬浮框，传就显示，不传不显示
            // tooltip 悬浮框
            // d 悬浮框的属性数据可以打印自己查看具体内容
            // d3E是d3，以免与全局的d3混淆
            // x 默认的x方向的偏移量
            // y 默认的y方向的偏移量
            customTooltips(tooltip, d, d3E, x, y) {
                let mess = '<span>姓名:</span><span>zs</span>'
                tooltip.html("<div class='tooltipLists'>" + mess + "</div>")
                    .style("transition", "all 0.3s")
                    // .style("left", (d3E.event.clientX) + "px")
                    // .style("top", (d3E.event.clientY) + "px")
                    .style("left", x + "px")
                    .style("top", y + "px")
                    .style("opacity", 0.9);
            },
            // 自定义显示 单元格文本
            isCustomShowText(d) {
                return d.properties.fh;
            },
            // 自定义 单元格内容即房间
            isCustomRoomG(d3, roomG, width, height) {
                // 图片
                roomG.append("image")
                    .attr("width", "40")
                    .attr("height", "70")
                    .attr("x", "5")
                    .attr("y", "5")
                    // .attr("xlink:href","img/apple-touch-icon.png") // 同级图片映入方式
                    // .attr("xlink:href","./static/images/unFinished.png") // public/static下面的图片引入的方式
                    .attr("xlink:href", "data:image/jpeg;base64," + imgBase64.imgBase64Data) // base64图片引入的方式
                // 文本
                let textIcon = roomG.append("g")
                    .attr("transform", "translate(" + (width - 30) + "," + (height - 50) + ")")
                    .attr("class", "textIcon")
                textIcon.append("text")
                    .attr("font-family", "微软雅黑")
                    .attr("font-size", "16px")
                    .attr("fill", "#d4f1d2")
                    .attr("class", "text")
                    .text(function (d) {
                        return d.properties.fh
                    })
                // d3 加载阿里字体图标
                let icon = roomG.append('foreignObject')
                    .attr('width', 20)
                    .attr('height', 20)
                    .attr('x', width - 30)
                    .attr('y', height - 30)
                    .html(function (d) {
                        return `<i class="jsmartFont">&#xe747;</i>`
                    })

                // let icon = roomG.append("use")
                //     .attr("width","20px")
                //     .attr("height","20px")
                //     .attr("x",width - 30)
                //     .attr("y",height - 30)
                //     .attr("xlink:href","#iconQQ")
            }
        }
    }
</script>

<style scoped>
    .lpbBox {
        width: 1000px;
        height: 800px;
        border: 1px solid red;
        display: flex;
        justify-content: center;
        overflow: hidden;
    }

    .buildDiagramTest {
        width: 100%;
        height: 800px;
        padding: 10px;
    }
</style>
