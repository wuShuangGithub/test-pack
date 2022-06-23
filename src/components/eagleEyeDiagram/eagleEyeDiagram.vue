<template>
    <div>
        鹰眼图
        <div id="forceMap"></div>
    </div>
</template>

<script>
    export default {
        name: "eagleEyeDiagram",
        data() {
            return {}
        },
        mounted() {
            let nodes = [
                {value:"66666666",type:"home",index:"0"},
                {value:"11111111111",type:"phone",index:"1"},
                {value:"22222222222",type:"phone",index:"2"},
                {value:"33333333333",type:"phone",index:"3"},
                {value:"44444444444",type:"phone",index:"4"},
                {value:"55555555555",type:"phone",index:"5"},
                {value:"aaa",type:"weixin",index:"6"},
                {value:"bbb",type:"weixin",index:"7"},
                {value:"ccc",type:"weixin",index:"8"},
                {value:"ddd",type:"weixin",index:"9"},
                {value:"eee",type:"weixin",index:"10"},
                {value:"fff",type:"weixin",index:"11"},
            ];
            let links = [
                {source:0,target:1},
                {source:0,target:2},
                {source:0,target:3},
                {source:0,target:4},
                {source:0,target:5},
                {source:2,target:6},
                {source:2,target:7},
                {source:2,target:8},
                {source:3,target:9},
                {source:3,target:10},
                {source:3,target:11},
            ];
            var height = 500;
            var width = 500;
            var svg = d3.select("#forceMap").append("svg")
                .attr("width",width)
                .attr("height",height)
                .attr("id","forceSvg");
            var mapG = svg.append("g")
                .attr("id","forceGroup");

            // var force = d3.force()
            //     .nodes(nodes)
            //     .links(links)
            //     .size([width,height])
            //     .linkDistance(100)
            //     .charge([-1250])
            //     .gravity(0.5)
            //     .friction(0.5);
            var force = d3.forceSimulation(nodes);

            force.force("link", d3.forceLink(links))
                .force("size",[width,height])
                .force("linkDistance",100)
                .force("charge",[-1250])
                .force("gravity", 0.5)
                .force("friction",0.5);
            force.start();
            var linkG = mapG.selectAll(".link")
                .data(links)
                .enter()
                .append("line")
                .attr("class","link")
                .attr("stroke","#ccc");
            var nodeG = mapG.selectAll(".node")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("class","node")
                .attr("r",8)
                .attr("fill",function(d){
                    switch(d.type){
                        case "home": return "red";break;
                        case"phone": return "blue";break;
                        case "weixin": return "green";break;
                    }
                })
                .call(force.drag); //这个例子为节点添加了可拖动的功能


            force.on("tick", function () {
                linkG.attr("x1", function (d) {
                    return d.source.x;
                })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });


                nodeG.attr("cx", function (d) {
                    return d.x
                })
                    .attr("cy", function(d){
                        return d.y
                    });
                drawThumb(); //在tick最后，执行绘制缩略图
            });

            // 绘制缩略图
            function drawThumb(){
                //每次绘制前删除之前的图形（这是一种简单有效的动画理论，但是比较消耗资源，之后会介绍如何节省资源完成需求）
                d3.select("#thumbSvg").remove();

                var thumbSvg = d3.select("#thumbMap").append("svg")
                    .attr("width",100)
                    .attr("height",100)
                    .attr("id","thumbSvg");
                var thumbG = thumbSvg.append("g")
                    .attr("id","thumbGroup");
                var thumbLink = thumbG.selectAll(".tlink")
                    .data(links)
                    .enter()
                    .append("line")
                    .attr("class","tlink")
                    .attr("stroke","#ccc")
                    //缩略图绘制和主图的差异在这，不需要tick，只需要把节点的坐标直接赋予即可
                    .attr("x1", function (d) {
                        return d.source.x/5;//这里的除5是缩略图和主图的比例，thumbWidth/forceWidth
                    })
                    .attr("y1", function (d) {
                        return d.source.y/5;
                    })
                    .attr("x2", function (d) {
                        return d.target.x/5;
                    })
                    .attr("y2", function (d) {
                        return d.target.y/5;
                    });
                var thumbNode = thumbG.selectAll(".tnode")
                    .data(nodes)
                    .enter()
                    .append("circle")
                    .attr("class","tnode")
                    .attr("r",1.2)//图形尺寸都要缩小
                    .attr("fill",function(d){
                        switch(d.type){
                            case "home": return "red";break;
                            case"phone": return "blue";break;
                            case "weixin": return "green";break;
                        }
                    })
                    .attr("cx", function (d) {
                        return d.x/5
                    })
                    .attr("cy", function(d){
                        return d.y/5
                    });
            }
        },
        methods:{

        }
    }
</script>

<style scoped>

</style>