// import * as d3 from "d3";
// import DATADICTIONARY_API from '../../api/dataDictionary.api.js'

class BuildingDiagram {
    constructor(opt_options) {
        const options = opt_options ? opt_options : ({});
        this.root = options.data;//接口数据
        this.target = options.targetId; // 楼盘表svg的id
        this.tooltip = options.tooltip !== undefined ? options.tooltip : null;
        this.tooltipLists = options.tooltipLists !== undefined ? options.tooltipLists : null;//悬浮窗
        this.legendColorLists = options.legendColorLists;//图例
        this.width = options.width !== undefined ? options.width : 1200;
        this.height = options.height !== undefined ? options.height : 900;
        this.splitFlag = options.splitFlag !== undefined ? options.splitFlag : false;
        this.mergeFlag = options.mergeFlag !== undefined ? options.mergeFlag : false;
        this.editFlag = options.editFlag !== undefined ? options.editFlag : false;//是否开启单个编辑
        this.dragFlag = options.dragFlag !== undefined ? options.dragFlag : false;//是否开启单个拖拽
        this.window_width = options.width !== undefined ? options.width : 1200;//设定底板宽
        this.window_height = options.height !== undefined ? options.height : 900;//设定底板高
        this.styleJson = options.styleJson.style; //样式json
        this.styleRule = options.styleJson.styleRule; //样式规则
        this.legendConfig = options.legendConfig; // 楼盘表图例配置
        this.scale = options.scale !== undefined ? options.scale : 1; // 默认当前比例
        this.scaling = [0.25, 4];//缩放比例
        this.translation = [0, 0];
        this.active;
        this.zoom = null; // 缩放
        this.svg = null; // svg
        this.g = null; // svg下面的第一个g
        this.tooltips = null; // 悬浮提示
        this.toolTipsOpacity = options.toolTipsOpacity ? options.toolTipsOpacity : 0.9;
        this.customTooltips = options.customTooltips; // 自定义悬浮事件
        this.onClickLpb = options.onClickLpb; // 鼠标单击事件
        this.onDblclickLpb = options.onDblclickLpb; // 鼠标双击事件
        this.isCustomShowText = options.isCustomShowText; // 自定义文本函数
        this.isCustomRoomG = options.isCustomRoomG; // 自定义单元格内容即房间内容

        this.offsetLeft = options.offsetLeft; // 楼盘表外边框左边距离浏览器左边的距离
        this.offsetTop = options.offsetTop; // 楼盘表外边框顶部距离浏览器顶部的距离
        this.zx = 0;
        this.zy = 0;
        if (this.root !== "") {
            this.init();
            this.getMainDomWh();
        }
    }

    /**
     * 渲染
     */
    init() {
        let svg = this.svg = d3.select("#" + this.target)
            .append("svg")
            .classed("svg-content-responsive", true)
            .attr("preserveAspectRatio", "xMidYMid meet")                               //维持外观比例
            .attr("viewbox", "0 0 " + this.window_width + " " + this.window_height)    //维持外观比例
            .attr("fill", "none")
            .on("click", this.stopped, true);
        //底版阴影
        svg.html("<defs><filter id='f1'>" +
            "<feOffset result='offOut' in='SourceAlpha' dx='0' dy='0'/>" +
            "<feGaussianBlur  in='SourceAlpha' result='blur' stdDeviation='2'></feGaussianBlur>" +
            "<feOffset  dx='0' dy='0' in='blur' result='offsetBlurredAlpha'></feOffset>" +
            "<feColorMatrix result='original' id='c1' in='offsetBlurredAlpha' type='matrix'" +
            " values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'/>" +
            "<feBlend in='SourceGraphic' in2='original' mode='normal'/>" +
            "</filter></defs>");
        this.draw(svg);
    }

    draw(svg) {
        let self = this;
        this.active = d3.select(null);
        //grouping
        let g = self.g = svg.append("g")
            .attr("transform", "translate(0,0)")
            .attr("class", "mainDom")
            .attr("id", self.target + "MainDom");
        //tooltip
        let tooltip = self.tooltips = d3.select(`#${self.target}Tooltip`)
            .attr("class", "tooltip")
            .style("opacity", 0.0);
        //全图缩放、拖拽
        let zoom = self.zoom = d3.zoom()
            .scaleExtent(this.scaling)
            .on("zoom", zoomHandler);

        let minScale = this.scaling[0];
        let maxScale = this.scaling[1];

        // primary display: initial projection to primary screen size
        let ident_bbox_projection = d3.geoIdentity()                 //不做投影变换
        // .fitSize([self.window_width, self.window_height], self.root);             //初始化图像大小为窗口大小

        let path = d3.geoPath()
            .projection(ident_bbox_projection);

        //每一个矩形块
        let gbox = g.selectAll("g")
            .data(this.root.features)
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
                return "translate(" + d.geometry.coordinates[0][0][0] + "," + d.geometry.coordinates[0][0][1] + ")";
            })
            .attr("id", function (d, i) {
                return d.properties.id;
            })
            .attr("code", function (d, i) {
                return d.properties.code;
            })//code
            .attr("class", function (d, i) {
                if (d.properties.type == 1) {//普通房间
                    return "roomG";
                } else if (d.properties.type == 4) {//表头
                    return "headerG";
                } else if (d.properties.type == 2) {//楼层
                    return "floorG";
                } else if (d.properties.type == 3) {//单元
                    return "unitListG";
                } else if (d.properties.type == 5) {//单元门
                    return "unitG";
                } else if (d.properties.type == 6) {//电梯
                    return "elevatorG";
                }
            })
            .on("click", function (d) {
                self.clicked(d);
                self.onClickLpb(d);
            }) // 鼠标单击
            .on("dblclick", function (d) {
                self.onDblclickLpb(d);
            }) // 鼠标双击
        // 普通房间 type = 1
        d3.selectAll(`#${self.target} .roomG`).each(function (d) {
            let style = {
                fill: '#3dc237'
            };
            d3.select(this)
                .attr("fill", style.fill)
                .attr("id", d.properties.id)
                .attr("code", d.properties.code);//添加房屋code
            //1、房间矩形
            d3.select(this).append("path")
                .attr("d", function (d) {
                    return "M0,0L" + (d.geometry.coordinates[0][1][0] - d.geometry.coordinates[0][0][0]) + "," +
                        (d.geometry.coordinates[0][1][1] - d.geometry.coordinates[0][0][1]) +
                        "L" + (d.geometry.coordinates[0][2][0] - d.geometry.coordinates[0][0][0]) +
                        "," + (d.geometry.coordinates[0][2][1] - d.geometry.coordinates[0][0][1]) + "L" +
                        (d.geometry.coordinates[0][3][0] - d.geometry.coordinates[0][0][0]) + "," +
                        (d.geometry.coordinates[0][3][1] - d.geometry.coordinates[0][0][1]) + "Z";
                })//根据房屋状态 condition渲染不同样式的room
                .attr("fill", style.fill)//房屋状态（已售、未售等等）
                .attr("stroke-width", "0.5px")
                .attr("stroke", "#00B0FD")
                .attr("class", "room");
            let width = (d.geometry.coordinates[0][1][0] - d.geometry.coordinates[0][0][0]);
            let height = (d.geometry.coordinates[0][3][1] - d.geometry.coordinates[0][0][1]);
            d3.select(this)
                .attr("cursor", "pointer")   //鼠标小手样式
                .on("mouseover", function (d, i) {
                    return self.tooltipBox(d);
                })
                .on("mouseleave", function (d, i) {
                    tooltip.style("opacity", 0.0);
                    tooltip.style("left", 0);
                    tooltip.style("top", 0);
                })

            let facStyle = {
                fill: '#d4f1d2',
                fontFamily: '微软雅黑',
                fontSize: '16px'
            };

            if (self.isCustomRoomG) {
                self.isCustomRoomG(d3, d3.select(this), width, height);
            } else {
                // 房间文本
                let facG = d3.select(this).append("g")
                //根据各个设备的状态渲染各个样式
                    .attr("transform", "translate(" + 10 + "," + (height - 15) + ")") //偏移量
                    .on("mouseover", function (d, i) {
                        return self.tooltipBox(d);
                    })
                    .on("mouseleave", function (d, i) {
                        tooltip.style("opacity", 0.0);
                        tooltip.style("left", 0);
                        tooltip.style("top", 0);
                    })
                    .attr("class", "textIcon");
                facG.append("text")
                    .attr("class", "text")
                    .attr('font-family', facStyle.fontFamily) //字体类型
                    .attr('fill', facStyle.fill)//字体颜色
                    .attr('font-size', facStyle.fontSize) //字体大小
                    .text(function (d) {
                        if (self.isCustomShowText) { // 自定义显示文本函数
                            return self.isCustomShowText(d);
                        } else {
                            return Number(d.properties.fh.length) * 20 > Math.abs(Number(d.geometry.coordinates[0][0][0]) - Number(d.geometry.coordinates[0][2][0])) ? d.properties.fh.substring(0, 4) + "..." : d.properties.fh;
                        }
                    })
            }
        });
        // 楼层 type = 2
        d3.selectAll(`#${self.target} .floorG`).each(function (d) {
            let floorStyle = {
                fill: '#044071',
                fontColor: '#d4f1d2',
                fontFamily: '微软雅黑',
                fontSize: '16px'
            }
            d3.select(this).append("path")
                .attr("d", function (d) {//外轮廓
                    return "M0,0L" + (d.geometry.coordinates[0][1][0] - d.geometry.coordinates[0][0][0]) + "," +
                        (d.geometry.coordinates[0][1][1] - d.geometry.coordinates[0][0][1]) +
                        "L" + (d.geometry.coordinates[0][2][0] - d.geometry.coordinates[0][0][0]) +
                        "," + (d.geometry.coordinates[0][2][1] - d.geometry.coordinates[0][0][1]) + "L" +
                        (d.geometry.coordinates[0][3][0] - d.geometry.coordinates[0][0][0]) + "," +
                        (d.geometry.coordinates[0][3][1] - d.geometry.coordinates[0][0][1]) + "Z";
                })
                .attr("fill", floorStyle.fill)
                .attr("stroke-width", "0.5px")
                .attr("stroke", "#00B0FD")
                .attr("class", "floor")
            // 楼层文本设置
            let floorWidth = d.geometry.coordinates[0][1][0] - d.geometry.coordinates[0][0][0];
            let floorHeight = d.geometry.coordinates[0][3][1] - d.geometry.coordinates[0][0][1];
            let entityG = d3.select(this)
                .append("text")
                .attr("x", floorWidth / 2) //单元名偏移量X
                .attr("y", floorHeight / 2) //单元名偏移量Y
                .attr('font-family', floorStyle.fontFamily) //字体类型
                .attr('fill', floorStyle.fontColor)//字体颜色
                .attr('font-size', floorStyle.fontSize) //字体大小
                .attr('text-anchor', 'middle') // 水平居中
                .attr('dominant-baseline', 'middle') // 垂直居中
                .text(function (d) {
                    if (d.properties.fh) {
                        return d.properties.fh
                    }
                    return "";
                })
        });
        // 单元 type = 3
        d3.selectAll(`#${self.target} .unitListG`).each(function (d) {
            let style = {
                fill: '#044071',
                fontColor: '#d4f1d2',
                fontFamily: '微软雅黑',
                fontSize: '16px'
            };
            // 单元文本设置
            let unitListWidth = d.geometry.coordinates[0][1][0] - d.geometry.coordinates[0][0][0];
            let unitListHeight = d.geometry.coordinates[0][3][1] - d.geometry.coordinates[0][0][1];
            d3.select(this).append("path")
                .attr("d", function (d) {//外轮廓
                    return "M0,0L" + (d.geometry.coordinates[0][1][0] - d.geometry.coordinates[0][0][0]) + "," +
                        (d.geometry.coordinates[0][1][1] - d.geometry.coordinates[0][0][1]) +
                        "L" + (d.geometry.coordinates[0][2][0] - d.geometry.coordinates[0][0][0]) +
                        "," + (d.geometry.coordinates[0][2][1] - d.geometry.coordinates[0][0][1]) + "L" +
                        (d.geometry.coordinates[0][3][0] - d.geometry.coordinates[0][0][0]) + "," +
                        (d.geometry.coordinates[0][3][1] - d.geometry.coordinates[0][0][1]) + "Z";
                })
                .attr("fill", style.fill)
                .attr("stroke-width", "0.5px")
                .attr("stroke", "#00B0FD")
                .attr("class", "floor")
            let entityG = d3.select(this)
                .append("text")
                .attr("x", unitListWidth / 2)//单元名偏移量X
                .attr("y", unitListHeight / 2)//单元名偏移量Y
                .attr('font-family', style.fontFamily) //字体类型
                .attr('fill', style.fontColor)//字体颜色
                .attr('font-size', style.fontSize) //字体大小
                .attr('text-anchor', 'middle') // 水平居中
                .attr('dominant-baseline', 'middle') // 垂直居中
                .text(function (d) {
                    if (d.properties.fh) {
                        return d.properties.fh
                        // return "单元号"
                    }
                    return "";
                })
        });
        // 表头 type = 4
        d3.selectAll(`#${self.target} .headerG`).each(function (d) {
            let style = {
                fill: '#044071'
            };
            // 单元文本设置
            let headerGHeight = d.geometry.coordinates[0][3][1] - d.geometry.coordinates[0][0][1];
            d3.select(this).append("path")
                .attr("d", function (d) {//外轮廓
                    return "M0,0L" + (d.geometry.coordinates[0][1][0] - d.geometry.coordinates[0][0][0]) + "," +
                        (d.geometry.coordinates[0][1][1] - d.geometry.coordinates[0][0][1]) +
                        "L" + (d.geometry.coordinates[0][2][0] - d.geometry.coordinates[0][0][0]) +
                        "," + (d.geometry.coordinates[0][2][1] - d.geometry.coordinates[0][0][1]) + "L" +
                        (d.geometry.coordinates[0][3][0] - d.geometry.coordinates[0][0][0]) + "," +
                        (d.geometry.coordinates[0][3][1] - d.geometry.coordinates[0][0][1]) + "Z";
                })
                .attr("fill", style.fill)
                .attr("stroke-width", "0.5px")
                .attr("stroke", "#00B0FD")
                .attr("class", "header")

            let headGLength = d3.selectAll(`#${self.target} .headerG`)._groups[0].length;
            let entityG = d3.select(this)
                .append("text")
                .attr("x", function (d) {
                    if (d.properties.fh == '单元') {
                        let headerGWidth = d.geometry.coordinates[0][1][0] - d.geometry.coordinates[0][0][0];
                        return headGLength == 3 ? headerGWidth / 2 + headerGWidth / 8 : headerGWidth / 2 + headerGWidth / 6;
                    } else if (d.properties.fh == '幢') {
                        let headerGWidth = d.geometry.coordinates[0][2][0] - d.geometry.coordinates[0][0][0];
                        return headerGWidth / 2 + headerGWidth / 4;
                    } else { // 层
                        let headerGWidth = d.geometry.coordinates[0][2][0] - d.geometry.coordinates[0][0][0];
                        return headerGWidth / 2 - headerGWidth / 8;
                    }

                }) // 偏移量X
                .attr("y", function () {
                    if (d.properties.fh == '层') {
                        return headerGHeight / 2 + headerGHeight / 4;
                    } else if (d.properties.fh == '幢') {
                        return headerGHeight / 2 - headerGHeight / 8;
                    } else { // 单元
                        return headGLength == 3 ? headerGHeight / 2 + headerGHeight / 8 : headerGHeight / 2 - headerGHeight / 6;
                    }
                }) // 偏移量Y
                .attr('fill', "#fff")//字体颜色
                .attr('font-size', "14px") //字体大小
                .attr('text-anchor', 'middle') // 水平居中
                .attr('dominant-baseline', 'middle') // 垂直居中
                .text(function (d) {
                    if (d.properties.fh) {
                        return d.properties.fh
                    }
                    return "";
                })
        });

        if (self.dragFlag || self.editFlag) {
            if (self.dragFlag) {
                svg.call(unitDrag).on("dblclick.zoom", true);
            } else if (self.editFlag) {
                d3.select(window).on("keydown", deleteUnit);
                svg.call(edit).on("mousedown", true);
            }
        } else {
            svg.call(zoom).on("dblclick.zoom", true);
        }

        // this affects both primary and tertiary displays
        // 拖拽 或者点击某个房间 滚动鼠标滚轮进行缩放
        function zoomHandler(newScale) {
            let prevScale = self.scale;
            let previousTranslation = self.getXYFromTranslate(g.attr('transform'));
            if (d3.event.sourceEvent) {
                let isZoomEvent = d3.event && d3.event.sourceEvent.deltaY;
                let isDragEvent = d3.event && ((d3.event.sourceEvent.screenX - d3.event.sourceEvent.pageX) || (d3.event.sourceEvent.screenY - d3.event.sourceEvent.pageY));//IE暂不支持movementX/Y该属性
                // let isDragEvent = d3.event && (d3.event.sourceEvent.movementX || d3.event.sourceEvent.movementY);//IE暂不支持movementX/Y该属性
                if (isZoomEvent) {
                    console.log("缩放事件")
                    self.scale = calculateNewScale(prevScale, d3.event.sourceEvent);
                    self.scale = checkScaleBounderies(self.scale);
                    let mousePosition = d3.mouse(this);
                    // Based on d3.js zoom algorithm
                    self.translation[0] = mousePosition[0] - ((mousePosition[0] - previousTranslation[0]) / prevScale) * self.scale;
                    self.translation[1] = mousePosition[1] - ((mousePosition[1] - previousTranslation[1]) / prevScale) * self.scale;
                    g.attr('transform', 'translate(' + self.translation + ') scale(' + self.scale + ')');     //1119
                } else if (isDragEvent || isDragEvent == 0) {//兼容f11按下时能拖拽
                    console.log("拖拽事件")
                    self.translation[0] = previousTranslation[0] + d3.event.sourceEvent.movementX;
                    self.translation[1] = previousTranslation[1] + d3.event.sourceEvent.movementY;
                    let mainDomEle = document.getElementById(`${self.target}MainDom`);
                    let wh = mainDomEle.getBBox();
                    if (self.translation[0] <= -(wh.width * self.scale - 80)) {
                        return;
                    }
                    if (self.translation[0] >= (self.window_width - 80)) {
                        return;
                    }
                    if (self.translation[1] <= -(wh.height * self.scale - 80)) {
                        return;
                    }
                    if (self.translation[1] >= (self.window_height - 80)) {
                        return;
                    }

                    g.attr('transform', 'translate(' + self.translation + ') scale(' + self.scale + ')');
                } else if (newScale) {//不执行
                    self.scale = newScale;
                }
                g.attr('transform', 'translate(' + self.translation + ') scale(' + self.scale + ')');
            } else {

                g.attr("transform", d3.event.transform); // updated for d3 v4
            }
        }


        function deleteUnit() {
            //监听键盘事件
            switch (d3.event.keyCode) {
                case 46: { // delete
                    if (d3.select(".active") !== null) {
                        d3.select(".active").remove();
                    }
                    break;
                }
            }
        }

        // Calculate the new scale value based on d3.js zoom formula
        function calculateNewScale(prevScale, event) {
            if (d3.event.sourceEvent) {
                return prevScale * Math.pow(2, -event.deltaY * (event.deltaMode ? 120 : 1) / 500);
            }
        }

        // Check if scale has reached max or min
        function checkScaleBounderies(newScale) {
            return Math.max(minScale, Math.min(maxScale, newScale));
        }

    }

    stopped() {
        if (d3.event.defaultPrevented) {
            d3.event.stopPropagation();
        }
    }

    getXYFromTranslate(transform) {
        let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttributeNS(null, 'transform', transform);
        let matrix = g.transform.baseVal.consolidate().matrix;
        return [matrix.e, matrix.f];
    }

    // 鼠标单击选中 并选中相对 某个属性值相同的房间（如: code 或者 id）
    clicked(d) {
        let clickD = d.properties.code; // 当前点击的房间对应的 code
        d3.selectAll(".roomG").each(function (d) {
            d3.select(this).classed("active", false);
        });
        if (d.properties.type == "1" || self.dragFlag || self.editFlag) { //未售或者编辑状态下可选中
            d3.selectAll(".roomG").each(function (d) {
                if (d.properties.code == clickD) {
                    d3.select(this).classed("active", true);
                }
            });
        }
    }

    // 还原
    reset() {
        this.getMainDomWh();
    }

    // 放大 or 缩小
    zoomHandler(type) {
        if (type == 'out' && this.scale <= 5) {
            this.scale = this.scale + 0.1;
        } else if (type == 'in' && this.scale >= 0.25) {
            this.scale = this.scale - 0.1;
        }
        let mainDomEle = document.getElementById(`${this.target}MainDom`);
        let wh = mainDomEle.getBBox();
        this.zx = 0 - 0 * this.scale;
        this.zy = 0 - 0 * this.scale;
        // 围绕中心点缩放
        // this.zx = (this.window_width - wh.width * this.scale) / 2;
        // this.zy = (this.window_height - wh.height * this.scale) / 2;

        let tran = {x: this.zx, y: this.zy, k: this.scale};
        this.g.attr("transform", `translate(${tran.x},${tran.y}),scale(${tran.k})`);
    }

    // 获取mainDom的宽度和高度 大于画布的画进行缩放
    getMainDomWh() {
        let mainDomEle = document.getElementById(`${this.target}MainDom`);
        let wh = mainDomEle.getBBox();
        let scaleW = this.window_width / wh.width;
        let scaleh = this.window_height / wh.height;
        if (scaleW > scaleh && scaleh < 1) {
            this.scale = scaleh;
            this.zoomHandler();
        } else if (scaleh > scaleW && scaleW < 1) {
            this.scale = scaleW;
            this.zoomHandler();
        }
    }

    // 导出图片
    exportPNG() {
        this.reset();
        let serializer = new XMLSerializer();
        let source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(this.svg.node());
        let image = new Image;
        image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
        let canvas = document.createElement("canvas");
        let mainDomEle = document.getElementById(`${this.target}MainDom`);
        let wh = mainDomEle.getBBox();
        canvas.width = wh.width * this.scale;
        canvas.height = wh.height * this.scale;
        let context = canvas.getContext("2d");
        context.fillStyle = '#fff';
        context.fillRect(0, 0, 10000,  10000);
        context.drawImage(image, 0, 0);
        image.onload = function () {
            context.drawImage(image, 0, 0);
            let a = document.createElement("a");
            a.download = "export_lpb.jpg";
            a.href = canvas.toDataURL("image/jpg");
            a.click();
        }
    }
    // 导出svg
    exportSVG() {
        this.reset();
        //get svg source.
        var serializer = new XMLSerializer();
        var source = serializer.serializeToString(this.svg.node());
        //add name spaces.
        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }
        //add xml declaration
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
        //convert svg source to URI data scheme.
        var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
        let a = document.createElement("a");
        a.download = "export_lpb.svg";
        a.href = url;
        a.click();
    }

    // 悬浮提示
    tooltipBox(d) {
        let self = this;
        if (self.dragFlag || self.editFlag) {
            return;
        }
        if (self.customTooltips) { // 自定义悬浮提示
            let px = d3.event.pageX - self.offsetLeft;
            let py = d3.event.pageY - self.offsetTop;
            self.customTooltips(self.tooltips, d, d3, px, py)
        } else { // 默认的悬浮提示
            let mess = "";
            if (self.tooltipLists.length == 0) {
                mess = "";
                return;
            }
            for (let i = self.tooltipLists.length - 1; i >= 0; i--) {
                if (self.tooltipLists[i].name == "建筑面积" && d.properties[self.tooltipLists[i].value] !== null) {
                    mess = "<div class='tooltipItem'><span>" + self.tooltipLists[i].name + "：</span>" + "<font>" + d.properties[self.tooltipLists[i].value] + "m²" + "</font></div>" + mess
                }
                else {
                    let data = d.properties[self.tooltipLists[i].value] === null ? "" : d.properties[self.tooltipLists[i].value];
                    mess = "<div class='tooltipItem'><span>" + self.tooltipLists[i].name + "：</span>" + "<font>" + data + "</font></div>" + mess
                }
            }
            self.tooltips.html("<div class='tooltipLists'>" + mess + "</div>")
                .style("transition", "all 0.3s")
                .style("left", d3.event.pageX - self.offsetLeft + "px")
                .style("top", d3.event.pageY - self.offsetTop + "px")
                .style("opacity", self.toolTipsOpacity);
        }
    }

    // 处理楼盘表样式 图例字典编码
    updateBuildStyleByDictCode(field, dictCode) {
        let dictData = [];
        // DATADICTIONARY_API.getDictData(dictCode).then(res => {
        //     dictData = res.data.data;
        // });
        this.updateBuildStyleByDictData(field, dictData);
    }

    // 处理楼盘表样式
    updateBuildStyleByDictData(field, dictData) {
        let legendIndex = {};
        dictData.forEach(item => {
            legendIndex[item.value] = item;
            this.updateBuildStyleByTlIndex(field, legendIndex);
        })
    }

    // 处理楼盘表样式
    updateBuildStyleByTlIndex(field, legendIndex) {
        this.updateBuildStyle(field, legendIndex);
    }

    // 获取深层对象最里面的值 如: let obj = {properties: { fwgl: { fwxz: "123"}}}; filed = "fwgl.fwxz" 获取123
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

    updateBuildStyle(field, legendIndex) {
        let self = this;
        d3.selectAll(`#${this.target} .roomG`).each(function (d) {
            var legendDataValue = self.getDeepValue(d.properties, field); //1
            if (legendIndex[legendDataValue]) { // 存在
                d3.select(this)
                    .attr("fill", legendIndex[legendDataValue].color);
                d3.select(this).select(".room").attr("fill", legendIndex[legendDataValue].color);
                d3.select(this).select(".text").attr("fill", "#fff");
            } else { // 不存在显示白色
                d3.select(this)
                    .attr("fill", "#fff");
                d3.select(this).select(".room").attr("fill", "#fff");
                d3.select(this).select(".text").attr("fill", "#000");
            }
        })
    }

    // 处理楼盘表样式  自定义楼盘表图例函数
    updateBuildStyleByCustomFunc(tlFunction) {
        d3.selectAll(`#${this.target} .roomG`).each(function (d) {
            tlFunction(d, d3.select(this).select(".room"));
        })
    }

    refreshLpTl() {
        let lpbConfig = this.legendConfig;
        // 楼盘表字段
        let filed = lpbConfig['field'];
        // 自定义楼盘表图例函数
        let customView = lpbConfig['customLpbLegendFunc'];
        // 图例字典索引
        let legendDictIndex = lpbConfig['legendDictIndex'];
        // 图例字典数据
        let legendDictData = lpbConfig['legendDictData'];
        // 图例字典编码
        let legendDictCode = lpbConfig['legendDictCode'];
        if (customView != null) {
            this.updateBuildStyleByCustomFunc(customView);
        } else if (JSON.stringify(legendDictIndex) != '{}') {
            this.updateBuildStyleByTlIndex(filed, legendDictIndex);
        } else if (legendDictData && legendDictData.length) {
            this.updateBuildStyleByDictData(filed, legendDictData);
        } else if (legendDictCode) {
            this.updateBuildStyleByDictCode(filed, legendDictCode);
        }
    }


}

export {BuildingDiagram};
