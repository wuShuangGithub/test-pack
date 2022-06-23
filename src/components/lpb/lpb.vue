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
  // import LpbTestApi from './lpb.api'
  import dataJson from "./data.json";

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
      // this.getLpbData();
      console.log(dataJson, "dataJson");
      if (dataJson.code == 0) {
        this.lpbData2 = dataJson.data;
        this.isShow = true;
      }

    },
    methods: {
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
      // 获取楼盘表数据
      getLpbData() {
        this.activeIndex = null;
        let url = API_PREFIX.PLATFORM + "/lpbglt/viewLpbGltGeoByZrzId";
        comUtils.getRemoteData(url, {
          "zrzid": this.zrzid, // 自然幢号
          "reload": "", // 是否刷新
          "config": {
            "standardWidthHouse": this.standardWidthHouse, // 标准宽度
            "standardHeightHouse": this.standardHeightHouse, // 标准高度
            "maxNum": this.maxNum // 最大房屋数
          }
        }).then(res => {
          if (res.data.code == 0) {
            this.lpbData2 = res.data.data;
            this.isShow = true;
          }
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
          .attr("xlink:href", "data:image/jpeg;base64,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") // base64图片引入的方式
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

<style lang="less" scoped>
  .lpbBox {
    width: 1000px;
    height: 800px;
    border: 1px solid red;
    display: flex;
    justify-content: center;
    overflow: hidden;
    .buildDiagramTest {
      width: 100%;
      height: 800px;
      padding: 10px;
    }
  }

</style>
