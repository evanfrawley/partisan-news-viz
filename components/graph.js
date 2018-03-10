import React from "react";
import D3Component from "idyll-d3-component";
const d3 = require('d3');
import {interpolateReds} from "d3-scale-chromatic";
const d3Scale = require('d3-scale-chromatic');

class Graph extends D3Component {

    initialize = (node, props) => {

        // svg to display network
        this.width = 600;
        this.height = 800;
	this.graphHeight = 400;
        this.svg = d3.select(node).append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.network = this.svg.append("g");

        this.rumors = this.svg.append("g")
            .attr("transform", "translate(0," + this.graphHeight + ")");

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

        if (this.props) {
          let {gamma, delta, eta, lambda, density, cluster} = props;
          this.modelParams.gamma.val = gamma;
          this.modelParams.cluster.val = cluster;
          this.modelParams.delta.val = delta;
          this.modelParams.eta.val = eta;
          this.modelParams.lambda.val = lambda;
          this.modelParams.density.val = density;
        }

        this.linkGroup = this.network.append("g");
        this.nodeGroup = this.network.append("g");

// <foreignobject class="node" x="46" y="22" width="100" height="100">
        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "fixed")
            .style("left", 100 + "px")
            .style("top", 100 + "px");

        console.log(this.tooltip);

        this.redraw();
    }

    update = (props) => {
        //TODO @Evan implement property update here
        let shouldRedraw = false;
        let {gamma, delta, eta, lambda, density, cluster} = props;
        if (
          this.modelParams.cluster.val !== cluster ||
          this.modelParams.density.val !== density
        ) {
          shouldRedraw = true;
        }
        this.modelParams.gamma.val = gamma;
        this.modelParams.cluster.val = cluster;
        this.modelParams.delta.val = delta;
        this.modelParams.eta.val = eta;
        this.modelParams.lambda.val = lambda;
        this.modelParams.density.val = density;
        if (shouldRedraw) {
          this.redraw();
        }
}

    redraw = () => {

        this.totalIndividuals = 0; // for chart viz
        this.activeNode = -1; // for hover effect

        d3.json("https://jessecoleman.github.io/sir-rumor-viz/data_" +
                this.modelParams.density.val + "_" +
                this.modelParams.cluster.val + ".json",
                (error, graph) => {

             if (error) throw error;

            console.log(graph);

            this.rumors.selectAll("svg").remove();

            this.graph = graph;

            let x = d3.scaleLinear()
                .domain([-1, 1])
                .range([0, this.width]);

            let y = d3.scaleLinear()
                .domain([-1, 1])
                .range([0, this.graphHeight]);

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
                        let text = "<ul>";
                        Object.keys(node.rumors).reverse().forEach((rumor) => {
                            text += "<li class=\"" +
                                node.rumors[rumor] +
                                "\">" + rumor + " " +
                                node.rumors[rumor] + "</li>";
                        });
                        return text;
                    })
                })
                .on("mouseout", (node) => {
                    this.activeNode = -1;
                    this.tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                })
                .style("curor", "pointer");
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
	//d3.select(d3.event.target).attr("fill", interpolateReds(Math.pow(1 - (1 / Math.pow(2, node.spreading+1)), 2)));
        this.rumor++;

	Object.keys(this.charts).forEach((c) => {
	    chart = this.charts[c];
            this.rumors.select("#chart_" + chart.rumor)
		.transition()
		.duration(250)
		.attr("transform", "translate(0," + (150 * (this.rumor - chart.rumor)) + ")")
	});

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
	
	Object.keys(this.modelParams).forEach((d) => {
	    chart[d] = this.modelParams[d].val
	});

        chart.element = this.rumors
            .append("g")
	    .attr("id", "chart_" + this.rumor)
            .attr("transform", "translate(0,-150)")
	    .style("opacity", 0)
            .on("mouseover", () => { this.selectedRumor = chart.rumor; this.setNodeFill(this.nodeGroup.selectAll("circle")); })
            .on("mouseout", () => { this.selectedRumor = -1; this.setNodeFill(this.nodeGroup.selectAll("circle")); });

	chart.element
	    .transition().duration(250)
            .attr("transform", "translate(0,0)")
	    .style("opacity", 1)
 
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

       	chart.text = chart.element.append("text")
	    .text(`λ: ${chart.lambda}`)
	    .attr("dy", "0.5em");
	    
	chart.text = chart.element.append("text")
	    .text(`η: ${chart.eta}`)
	    .attr("dy", "2em");
	
       	chart.text = chart.element.append("text")
	    .text(`γ: ${chart.gamma}`)
	    .attr("dy", "3.5em");

       	chart.text = chart.element.append("text")
	    .text(`δ: ${chart.delta}`)
	    .attr("dy", "5em");

	this.charts[this.rumor] = chart;
        this.infecting = false;
    }

    startInterval = () => {
        d3.interval(() => {
            this.iter++;
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
                                        neighbor.newRumors[rumor] = Math.random() < this.charts[rumor].lambda ? "spreader" : "stifler";
                                    } else if (neighbor.rumors[rumor] == "spreader") {
                                        neighbor.newRumors[rumor] = Math.random() > this.charts[rumor].gamma ? "spreader" : "stifler";
                                    }
                                } else if (node.rumors[rumor] == "stifler" && neighbor.rumors[rumor] == "spreader") {
                                    neighbor.newRumors[rumor] = Math.random() > this.charts[rumor].eta ? "spreader" : "stifler";
                                }
                            } else if (Math.random() < this.charts[rumor].delta) {
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
