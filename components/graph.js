import React from "react";
import D3Component from "idyll-d3-component";
const d3 = require('d3');
import {interpolateReds} from "d3-scale-chromatic";
const d3Scale = require('d3-scale-chromatic');

/*
<div class="container top-buffer">
    <div class="row">
        <div id="flowchart" class="col-sm-12"></div>
    </div>
    <div class="row">
        <div id="graph" class="col-sm-12 col-md-8">
            <span class="slider">
                <label for="density">Density</label>
                <input id="density" type="range" min="0.01" max="0.02" step="0.0025">
                <label for="cluster">Clustering Coefficient</label>
                <input id="cluster" type="range" min="0.5" max="0.9" step="0.1">
                <label for="lambda"><strong>λ</strong></label>
                <input id="lambda" type="range" min="0" max="1" step="0.1"><span class="value"/>
                <label for="eta">η</label>
                <input id="eta" type="range" min="0" max="1" step="0.1"><span class="value"/>
                <label for="gamma">γ</label>
                <input id="gamma" type="range" min="0" max="1" step="0.1"><span class="value"/>
                <label for="delta">δ</label>
                <input id="delta" type="range" min="0" max="1" step="0.1"><span class="value"/>
                </span>
        </div>
        <div id="rumor-list" class="col-sm-12 col-md-4">
        </div>
        <div id="hist" class="col-sm-4">
        </div>
    </div>
</div>


<link
    rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
    integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
    crossorigin="anonymous">
<script
  src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
  integrity="sha256-3edrmyuQ0w65f8gfBsqowzjJe2iM6n0nKciPUp8y+7E="
  crossorigin="anonymous"></script>
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="https://d3js.org/d3-color.v1.min.js"></script>
<script src="https://d3js.org/d3-scale-chromatic.v1.min.js"></script>
*/
class Graph extends D3Component {

    initialize = (node, props) => {

        // svg to display network
        this.width = 600;
        this.height = 400;
        this.image = d3.select(node).append("svg")
            .attr("width", this.width)
            .attr("height", 1.5 * this.height);

        this.svg = this.image.append("g")

        this.rumors = this.image.append("g")
            .attr("transform", "translate(0," + 400 + ")");

        this.modelParams = {
            "density": {
                "min": 0.01,
                "max": 0.02,
                "step": 0.0025,
                "val": 0.01
            }, "cluster": {
                "min": 0,
                "max": 1,
                "step": 0.1,
                "val": 0.7
            }, "lambda": {
                "min": 0,
                "max": 1,
                "step": 0.1,
                "val": 0.8
            }, "eta": {
                "min": 0,
                "max": 1,
                "step": 0.1,
                "val": 0.6,
            }, "gamma": {
                "min": 0,
                "max": 1,
                "step": 0.1,
                "val": 0.3
            }, "delta": {
                "min": 0,
                "max": 1,
                "step": 0.1,
                "val": 0.2
            }
        };

        this.linkGroup = this.svg.append("g");
        this.nodeGroup = this.svg.append("g");

        this.tooltip = this.svg.append("div")
            .attr("class", "tooltip");

        console.log(this.tooltip);

        this.redraw();
    }

    update = (props) => {
        //TODO @Evan implement property update here

        // set the values like this
        this.modelParams.lambda.val = 0;
        console.log(props);
    }

    redraw = () => {

        this.totalIndividuals = 0; // for chart viz
        this.activeNode = -1; // for hover effect

        d3.json("https://jessecoleman.github.io/sir-rumor-viz/data_" + 
                this.modelParams.density.val + "_" +
                this.modelParams.cluster.val + ".json", 
                (error, graph) => {
//        d3.json("data_" + 
//                this.modelParams.density.default + "_" +
//                this.modelParams.cluster.default + ".json", 
//                (error, graph) => {
             if (error) throw error;

            console.log(graph);

            this.rumors.selectAll("svg").remove();

            this.graph = graph;

            let x = d3.scaleLinear()
                .domain([-1, 1])
                .range([0, this.width]);

            let y = d3.scaleLinear()
                .domain([-1, 1])
                .range([0, this.height]);

            graph.nodes.forEach((node) => {
                this.totalIndividuals++;
                node.rumors = {};
                node.newRumors = {};
                node.neighbors = [];
                node.spreading = 0;
                node.rank = +node.rank;
                node.x = +node.x;
                node.y = +node.y;
            });

            graph.links.forEach((l) => {
                graph.nodes[l.target].neighbors.push(l.source);
            });

            let links = this.linkGroup.selectAll("line")
                .data(graph.links)

            links.enter().append("line")
                .merge(links)
                .attr("class", "links")
                .attr("x1", (d) => { return x(graph.nodes[d.source].x); })
                .attr("y1", (d) => { return y(graph.nodes[d.source].y); })
                .attr("x2", (d) => { return x(graph.nodes[d.target].x); })
                .attr("y2", (d) => { return y(graph.nodes[d.target].y); })
                .attr("stroke", "#ccc")
                .attr("stroke-width", 1)
                .attr("opacity", 0)
                .transition().delay(500).duration(100)
                .attr("opacity", 1)

            links.exit().remove()

            let radius = d3.scaleSqrt()
                .range([4, 7])
                .domain(d3.extent(graph.nodes, (node) => { return node.rank; }));

            let nodes = this.nodeGroup
                .selectAll("circle")
                .data(graph.nodes);

            nodes.enter().append("circle")
                .merge(nodes)
                .transition()
                .duration(500)
                .attr("class", "nodes")
                .attr("r", (d) => { return radius(d.rank); })
                .attr("cx", (d) => { return x(d.x); })
                .attr("cy", (d) => { return y(d.y); })
                .attr("fill", (d) => { return interpolateReds(0); })
                .style("stroke", "#666")

            this.nodeGroup.selectAll("circle")
                .on("mouseup", this.infect)
                .on("mouseover", (node) => {
                    this.activeNode = node.id;
                    this.tooltip.transition()
                        .duration(200)
                        .style("opacity", 1);
                    this.tooltip.html((d) => {
                        var text = "<ul>";
                        Object.keys(node.rumors).reverse().forEach((rumor) => {
                            text += "<li class=\"" +
                                node.rumors[rumor] +
                                "\">" + rumor + " " +
                                node.rumors[rumor] + "</li>";
                        });
                        return text;
                    })
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px");
                })
                .on("mouseout", (node) => {
                    this.activeNode = -1;
                    this.tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
        });

        this.iter = 0;
        this.rumor = 0;
        this.selectedRumor = -1;

        this.charts = {};
        this.rumorStates = {};
        this.infecting = false;

    }

    infect = (node) => {

        this.infecting = true;
        if (this.rumor == 0) {
            this.startInterval();
        }
        d3.select(d3.event.target).attr("fill", "red"); //interpolateReds(Math.pow(1 - (1 / Math.pow(2, node.spreading+1)), 2)));
        this.rumor++;

        this.rumorStates[this.rumor] = {};
        this.rumorStates[this.rumor].ignorant = this.totalIndividuals - 1;
        this.rumorStates[this.rumor].spreading = 1;
        this.rumorStates[this.rumor].stifling = 0;
        node.rumors[this.rumor] = "spreader";

        var chart = {};
        chart.rumor = this.rumor
        chart.margin = {top: 5, right: 30, bottom: 30, left: 5};
        chart.width = this.width - chart.margin.left - chart.margin.right;
        chart.height = 150 - chart.margin.top - chart.margin.bottom;
        chart.element = this.rumors
            //.insert("svg", ":first-child")
            .append("g")
                .attr("transform", "translate(0," + 150 * (chart.rumor-1) + ")")
                .attr("id", this.rumor)
            //.attr("width", chart.width + chart.margin.left + chart.margin.right)
            //.attr("height", chart.height + chart.margin.top + chart.margin.bottom)
            .on("mouseover", () => { this.selectedRumor = chart.rumor; setNodeFill(nodeGroup.selectAll("circle")); })
            .on("mouseout", () => { this.selectedRumor = -1; setNodeFill(nodeGroup.selectAll("circle")); });

        chart.x = d3.scaleLinear()
            .rangeRound([0, chart.width])
            .domain([this.iter - 20, this.iter]);

        chart.y = d3.scaleLinear()
            .rangeRound([chart.height, 0])
            .domain([0, this.totalIndividuals]);

        chart.line = d3.line()
            .x((d) => { return chart.x(d.iter); })
            .y((d) => { return chart.y(d.count); });

        chart.axisBottom = chart.element.append("g")
            .attr("transform", "translate(" + chart.margin.left + "," + (chart.margin.top + chart.height) + ")")
            .call(d3.axisBottom(chart.x).ticks(10));

        chart.axisLeft = chart.element.append("g")
            .attr("transform", "translate(" + (chart.margin.left + chart.width) + "," + chart.margin.top + ")")
            .call(d3.axisRight(chart.y).ticks(5))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Ratios");

        chart.line = d3.line()
            .x((d) => { return chart.margin.left + chart.x(d.iter); })
            .y((d) => { return chart.margin.top + chart.y(d.count); });

        chart.data = {
            "ignorant": [{"iter": this.iter, "count": this.totalIndividuals - 1}],
            "spreading": [{"iter": this.iter, "count": 1}],
            "stifling": [{"iter": this.iter, "count": 0}]
        };

        chart.lineIgnorant = chart.element.append("path")
            .data(chart.data.ignorant)
            .attr("class", "line ignorant")
            .attr("fill", "none")
            .attr("stroke", "#2196F3")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", chart.line);

        chart.lineSpreading = chart.element.append("path")
            .data(chart.data.spreading)
            .attr("class", "line spreading")
            .attr("fill", "none")
            .attr("stroke", "#F44336")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", chart.line);

        chart.lineStifling = chart.element.append("path")
            .data(chart.data.stifling)
            .attr("class", "line stifling")
            .attr("fill", "none")
            .attr("stroke", "#4CAF50")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", chart.line);

        this.charts[this.rumor] = chart;
        this.infecting = false;
    }

    startInterval = () => {
        d3.interval(() => {
            this.iter++;

            //while (infecting) {}

            // interaction between nodes and neighbors
            this.graph.nodes.forEach((node) => {
                node.neighbors.forEach((n) => {
                    let neighbor = this.graph.nodes[n];

                    // probability of interacting decreases with number of previous interactions
                    if (1 / Math.pow(Object.keys(neighbor.rumors).length + 1, 2) > Math.random()) {

                        let spread = false;
                        let rumorAge = 1;
                        let r = Math.random();
                        Object.keys(node.rumors).sort().reverse().forEach((rumor) => {
                            // probability of sharing rumor given age
                            if (1 - (1 / Math.pow(2, rumorAge)) < r && !spread) {
                                spread = true;
                                if (node.rumors[rumor] == "spreader") {
                                    if (!neighbor.rumors.hasOwnProperty(rumor)) {
                                        neighbor.newRumors[rumor] = Math.random() < this.modelParams.lambda.val ? "spreader" : "stifler";
                                    } else if (neighbor.rumors[rumor] == "spreader") {
                                        neighbor.newRumors[rumor] = Math.random() > this.modelParams.gamma.val ? "spreader" : "stifler";
                                    }
                                } else if (node.rumors[rumor] == "stifler" && neighbor.rumors[rumor] == "spreader") {
                                    neighbor.newRumors[rumor] = Math.random() > this.modelParams.eta.val ? "spreader" : "stifler";
                                }
                            } else if (Math.random() < this.modelParams.delta.val) {
                                // probability that node forgets rumor
                                node.newRumors[rumor] = "stifler";
                            }
                            rumorAge++;
                        });
                    }
                });
            });

            Object.keys(this.rumorStates).forEach((r) => {
                this.rumorStates[r].ignorant = this.totalIndividuals;
                this.rumorStates[r].spreading = 0;
                this.rumorStates[r].stifling = 0;
            })
            // update graph data
            this.graph.nodes.forEach((node) => {

                Object.keys(node.newRumors).forEach((rumor) => {
                    node.rumors[rumor] = node.newRumors[rumor];
                });
                node.newRumors = {};

               // count number of active rumors
                node.spreading = 0;
                node.stifling = 0;
                Object.keys(node.rumors).forEach((r) => {

                    if (node.rumors[r] == "spreader") {
                        this.rumorStates[r].spreading++;
                        this.rumorStates[r].ignorant--;
                        //node.spreading += 1 / Math.pow(rumor - r, 2);
                        node.spreading += 1;
                    } else if (node.rumors[r] == "stifler") {
                        this.rumorStates[r].stifling++;
                        this.rumorStates[r].ignorant--;
                        node.stifling += 1 / Math.pow(this.rumor - r, 2);
                    }
                });

                if (node.id == this.activeNode) {
                    this.tooltip.html((d) => {
                        var text = "<ul>";
                        Object.keys(node.rumors).reverse().forEach((rumor) => {
                            text += "<li class=\"" + node.rumors[rumor] + "\">" +
                                rumor + " " + node.rumors[rumor] + "</li>";
                        })
                        return text;
                    })
                }
            });

            this.setNodeFill(this.nodeGroup.selectAll("circle"));

            // update chart data
            Object.keys(this.charts).forEach((r) => {

                let chart = this.charts[r];

                chart.data.ignorant.push({"iter": this.iter, "count": this.rumorStates[r].ignorant});
                chart.data.spreading.push({"iter": this.iter, "count": this.rumorStates[r].spreading});
                chart.data.stifling.push({"iter": this.iter, "count": this.rumorStates[r].stifling});

                chart.x.domain([this.iter - 20, this.iter]);
                chart.axisBottom
                    .call(d3.axisBottom(chart.x).ticks(10))
                chart.axisLeft
                    .call(d3.axisLeft(chart.y))
                    .append("text")
                    .attr("fill", "#000")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", "0.71em")
                    .attr("text-anchor", "end")
                    .text("Ratios");

                chart.lineIgnorant
                    .datum(chart.data.ignorant)
                    .attr("d", chart.line);

                chart.lineSpreading
                    .datum(chart.data.spreading)
                    .attr("d", chart.line);

                chart.lineStifling
                    .datum(chart.data.stifling)
                    .attr("d", chart.line);
            });

        }, 1000);
    }

    setNodeFill = (nodes) => {
        nodes.style("fill", (node) => {
            if (this.selectedRumor == -1) {
                return d3Scale.interpolateReds(Math.pow(1 - (1 / Math.pow(2, node.spreading)), 2));
            } else if (node.rumors[this.selectedRumor] == "spreader") {
                return "#E57373";
            } else if (node.rumors[this.selectedRumor] == "stifler") {
                return "#81C784";
            } else {
                return interpolateReds(0);
            }
        });
    }
}

export default Graph;
