import React from "react";
import D3Component from "idyll-d3-component";
const d3 = require('d3');
import {interpolateReds} from "d3-scale-chromatic";
const d3Scale = require('d3-scale-chromatic');

class Graph extends D3Component {

    initialize = (node, props) => {

        // svg to display network
        this.width = 1200;
        this.height = 650;
        this.graphHeight = 650;
        this.svg = d3.select(node).append("svg")
            .attr("id", "network")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("transform", "translate(0,-600)")
            .attr("pointer-events", "none");


        this.network = this.svg.append("g")
            .attr("id", "network")
            .attr("transform", "translate(400,0)")
            .attr("pointer-events", "auto");

        this.rumors = this.svg.append("g")
            .attr("transform", "translate(0," + this.graphHeight + ")");

        this.density = props.density;
        this.cluster = props.cluster;
        this.lambda = props.lambda;
        this.eta = props.eta;
        this.gamma = props.gamma;
        this.delta = props.delta;

        this.linkGroup = this.network.append("g");
        this.nodeGroup = this.network.append("g");

        this.tooltip = this.network.append("g")
            .attr("class", "tooltip");

        this.redraw();
    }

    update = (props) => {
        let shouldRedraw = false;
        let {gamma, delta, eta, lambda, density, cluster} = props;
        if (
            this.cluster !== cluster ||
            this.density !== density
        ) { shouldRedraw = true; }

        this.density = density;
        this.cluster = cluster;
        this.lambda = lambda;
        this.gamma = gamma;
        this.eta = eta;
        this.delta = delta;

        if (shouldRedraw) {
            this.redraw();
        }
}

    redraw = () => {

        this.height = 650;
        
        this.svg.transition().duration(150)
            .attr("height", this.height);

        this.totalIndividuals = 0; // for chart viz
        this.activeNode = -1; // for hover effect

        this.rumors.selectAll("g").remove();
        if(this.interval) {
            this.interval.stop();
        }

        d3.json("https://jessecoleman.github.io/sir-rumor-viz/data_" +
                this.density + "_" +
                this.cluster + ".json",
                (error, graph) => {

            console.log(this.density);
            console.log(this.cluster);

            if (error) throw error;

            this.rumors.selectAll("svg").remove();

            this.graph = graph;

            let x = d3.scaleLinear()
                .domain([-1, 1])
                .range([10, this.width - 410]);

            let y = d3.scaleLinear()
                .domain([-1, 1])
                .range([10, this.graphHeight - 10]);

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
                .style("stroke", "#888")

            this.nodeGroup.selectAll("circle")
                .on("mouseup", this.infect)
                .on("mouseover", (node) => {

                    this.activeNode = node.id;

                    this.tooltip
                        .attr("transform", `translate(
                            ${d3.event.clientX - document.getElementById("network").getBoundingClientRect().x + 10}, 
                            ${d3.event.clientY - document.getElementById("network").getBoundingClientRect().y + 80})`)
                        .transition()
                        .duration(200)
                        .style("opacity", 1);
                    
                    let text = [];
                    let index = 0;

                    Object.keys(node.rumors).reverse().forEach((rumor) => {
                        text.push({
                            "rumor": rumor,
                            "status": node.rumors[rumor], 
                            "position": index
                        });
                        index++;
                    });

                    let tooltipBackground = this.tooltip.selectAll("rect")
                        .data(text);

                    let tooltipText = this.tooltip.selectAll("text")
                        .data(text);

                    tooltipBackground.enter().append("rect")
                        .merge(tooltipBackground)
                        .attr("width", "5em")
                        .attr("height", "1.5em")
                        .attr("y", (d) => { return 1.5 * d.position - 1 + "em"; })
                        .attr("fill", (d) => {
                            if (d.status == "spreader") return "#E57373";
                            else if (d.status == "stifler") return "#81C784";
                        });
                               
                    tooltipText.enter().append("text")
                        .merge(tooltipText)
                        .text((d) => { return d.rumor + " " + d.status; })
                        .attr("y", (d) => { return 1.5 * d.position + "em"; })
                        .attr("dx", "0.5em") 
                        .attr("dy", "0.1em");

                    tooltipBackground.exit().remove();
                    tooltipText.exit().remove();
                })
                .on("mouseout", (node) => {
                    this.activeNode = -1;
                    this.tooltip
                        .attr("x", "-6em")
                        .transition()
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

        this.height += 150;
        console.log(this.height);
        this.svg.transition().duration(150)
            .attr("height", this.height);

        this.infecting = true;
        if (this.rumor == 0) {
            this.startInterval();
        }
        d3.select(d3.event.target)
            .attr("fill", interpolateReds(Math.pow(1 - (1 / Math.pow(2, node.spreading+1)), 2)));
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
        // set parameters for rumor
        this.rumorStates[this.rumor].lambda = this.lambda;
        this.rumorStates[this.rumor].gamma = this.gamma;
        this.rumorStates[this.rumor].eta = this.eta;
        this.rumorStates[this.rumor].delta = this.delta;

        node.rumors[this.rumor] = "spreader";

        let chart = {};
        chart.rumor = this.rumor
        chart.margin = {top: 5, right: 50, bottom: 30, left: 5};
        chart.width = this.width - chart.margin.left - chart.margin.right;
        chart.height = 150 - chart.margin.top - chart.margin.bottom;
	
        chart.element = this.rumors
            .append("g")
            .attr("id", "chart_" + this.rumor)
            .attr("transform", "translate(0,-150)")
            .style("opacity", 0)
            .attr("pointer-events", "auto")
            .on("mouseover", () => { this.selectedRumor = chart.rumor; this.setNodeFill(this.nodeGroup.selectAll("circle")); })
            .on("mouseout", () => { this.selectedRumor = -1; this.setNodeFill(this.nodeGroup.selectAll("circle")); });

        chart.element
            .append("rect")
            .attr("x", chart.margin.left)
            .attr("y", chart.margin.top)
            .attr("width", chart.width)
            .attr("height", chart.height)
            .attr("opacity", 0);

        chart.element
            .transition().duration(250)
            .attr("transform", "translate(0,0)")
            .style("opacity", 1)
 
        chart.element.append("text")
            .text("rumor #" + chart.rumor)
            .attr("transform", "rotate(-90)")
            .attr("dx", -chart.height + chart.margin.bottom)
            .attr("dy", chart.width + chart.margin.right);

        chart.x = d3.scaleLinear()
            .rangeRound([0, chart.width])
            .domain([this.iter - 50, this.iter]);

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
            .text(`λ: ${this.rumorStates[chart.rumor].lambda}`)
            .attr("dy", "0.5em");
	    
        chart.text = chart.element.append("text")
            .text(`η: ${this.rumorStates[chart.rumor].eta}`)
            .attr("dy", "2em");
	
       	chart.text = chart.element.append("text")
            .text(`γ: ${this.rumorStates[chart.rumor].gamma}`)
            .attr("dy", "3.5em");

       	chart.text = chart.element.append("text")
            .text(`δ: ${this.rumorStates[chart.rumor].delta}`)
            .attr("dy", "5em");

        this.charts[this.rumor] = chart;
            this.infecting = false;
    }

    startInterval = () => {
        this.interval = d3.interval(() => {
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
                                        neighbor.newRumors[rumor] = Math.random() < this.rumorStates[rumor].lambda ? "spreader" : "stifler";
                                    } else if (neighbor.rumors[rumor] == "spreader") {
                                        neighbor.newRumors[rumor] = Math.random() > this.rumorStates[rumor].gamma ? "spreader" : "stifler";
                                    }
                                } else if (node.rumors[rumor] == "stifler" && neighbor.rumors[rumor] == "spreader") {
                                    neighbor.newRumors[rumor] = Math.random() > this.rumorStates[rumor].eta ? "spreader" : "stifler";
                                }
                            } else if (Math.random() < this.rumorStates[rumor].delta) {
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

                    let text = [];
                    let index = 0;

                    Object.keys(node.rumors).reverse().forEach((rumor) => {
                        text.push({
                            "rumor": rumor, 
                            "status": node.rumors[rumor], 
                            "position": index
                        });
                        index++;
                    });
 
                    let tooltipBackground = this.tooltip.selectAll("rect")
                        .data(text);

                    let tooltipText = this.tooltip.selectAll("text")
                        .data(text);

                    tooltipBackground.enter().append("rect")
                        .merge(tooltipBackground)
                        .attr("width", "5em")
                        .attr("height", "1.5em")
                        .attr("y", (d) => { return 1.5 * d.position - 1 + "em"; })
                        .attr("fill", (d) => {
                            if (d.status == "spreader") return "#E57373";
                            else if (d.status == "stifler") return "#81C784";
                        });
       
                    tooltipText.enter().append("text")
                        .merge(tooltipText)
                        .text((d) => { return d.rumor + " " + d.status; })
                        .attr("y", (d) => { return 1.5 * d.position + "em"; })
                        .attr("dx", "0.5em") 
                        .attr("dy", "0.1em");

                    tooltipBackground.exit().remove();
                    tooltipText.exit().remove();
                }
            });

            this.setNodeFill(this.nodeGroup.selectAll("circle"));

            // update chart data
            Object.keys(this.charts).forEach((r) => {

                let chart = this.charts[r];

                chart.data.ignorant.push({"iter": this.iter, "count": this.rumorStates[r].ignorant});
                chart.data.spreading.push({"iter": this.iter, "count": this.rumorStates[r].spreading});
                chart.data.stifling.push({"iter": this.iter, "count": this.rumorStates[r].stifling});

                chart.x.domain([this.iter - 50, this.iter]);
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
