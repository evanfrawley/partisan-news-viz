const D3Component = require('idyll-d3-component');
const d3 = require('d3');

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
    
    redraw = () => {

        console.log("redrawn");
        
        var totalIndividuals = 0; // for chart viz
        var activeNode = -1; // for hover effect
        

        d3.json(`https://jessecoleman.github.io/sir-rumor-viz/data_${this.modelParams.density.default}_${this.modelParams.cluster.default}.json`, (error, graph_data) => {
        //d3.json(`data_${this.modelParams.density.default}_${this.modelParams.cluster.default}.json`, function(error, graph_data) {
            if (error) throw error;
            d3.select("#rumor-list").selectAll("svg").remove();

            this.x = d3.scaleLinear()
                .domain([-1, 1])
                .range([0, this.width]);
    
            this.y = d3.scaleLinear()
                .domain([-1, 1])
                .range([0, this.height]);
    
            graph_data.nodes.forEach((node) => {
                totalIndividuals++;
                node.rumors = {};
                node.newRumors = {};
                node.neighbors = [];
                node.spreading = 0;
                node.rank = +node.rank;
                node.x = +node.x;
                node.y = +node.y;
            });
        
            graph_data.links.forEach((l) => {
                graph_data.nodes[l.target].neighbors.push(l.source);
            });
        
            var links = linkGroup.selectAll("line")
                .data(graph_data.links)
    
            console.log(6);
            links.enter().append("line")
                .merge(links)
                .attr("class", "links")
                .attr("x1", function(d) { return this.x(graph_data.nodes[d.source].x); })
                .attr("y1", function(d) { return this.y(graph_data.nodes[d.source].y); })
                .attr("x2", function(d) { return this.x(graph_data.nodes[d.target].x); })
                .attr("y2", function(d) { return this.y(graph_data.nodes[d.target].y); })
                .attr("stroke", "#ccc")
                .attr("stroke-width", 1)
                .attr("opacity", 0)
                .transition().delay(500).duration(100)
                .attr("opacity", 1)
    
            links.exit().remove()
    
            console.log(7);
            var radius = d3.scaleSqrt()
                .range([4, 7])
                .domain(d3.extent(graph_data.nodes, function(node) { return node.rank; }));
    
            var nodes = nodeGroup
                .selectAll("circle")
                .data(graph_data.nodes);
    
            nodes.enter().append("circle")
                .merge(nodes)
                .transition()
                .duration(500)
                .attr("class", "nodes")
                .attr("r", function(d) { return radius(d.rank); })
                .attr("cx", function(d) { return this.x(d.x); })
                .attr("cy", function(d) { return this.y(d.y); })
                .attr("fill", function(d) { return d3.interpolateReds(0); })
                .style("stroke", "#666")
    
            nodeGroup.selectAll("circle")
                .on("click", infect)
                .on("mouseover", function(node) {
                    activeNode = node.id;
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 1);
                    tooltip.html(function(d) {
                        var text = "<ul>";
                        Object.keys(node.rumors).reverse().forEach(function(rumor) {
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
                .on("mouseout", function(node) {
                    activeNode = -1;
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0);
                });
        
        });
    }

    initialize = (node, props) => {

        // svg to display network
        this.width = 800;
        this.height = 400;
        this.svg = d3.select(node).append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
    
    
        this.modelParams = {
            "density": {
                "min": 0.01,
                "max": 0.02,
                "step": 0.0025,
                "default": 0.01
            }, "cluster": {
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 0.7
            }, "lambda": {
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 0.8
            }, "eta": {
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 0.6,
            }, "gamma": {
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 0.3
            }, "delta": {
                "min": 0,
                "max": 1,
                "step": 0.1,
                "default": 0.2
            }
        };
    
        this.linkGroup = graph.svg.append("g");
        this.nodeGroup = graph.svg.append("g");

        this.redraw();

        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip");
    }
       
    startInterval = () => {
        d3.interval(function() {
            iter++;
        
            //while (infecting) {}
        
            // interaction between nodes and neighbors
            this.nodes.forEach(function(node) {
            
                //neighbor = graph.nodes[node.neighbors[Math.floor(Math.random()*node.neighbors.length)]];
            
                node.neighbors.forEach(function(n) {
                    neighbor = graph_data.nodes[n];
                
                    // probability of interacting decreases with number of previous interactions
                    if (1 / Math.pow(Object.keys(neighbor.rumors).length + 1, 2) > Math.random()) {
                    
                        var spread = false;
                        var rumorAge = 1;
                        var r = Math.random();                        
                        Object.keys(node.rumors).sort().reverse().forEach(function(rumor) {
                            // probability of sharing rumor given age
                            if (1 - (1 / Math.pow(2, rumorAge)) < r && !spread) {
                                spread = true;
                                if (node.rumors[rumor] == "spreader") {
                                    if (!neighbor.rumors.hasOwnProperty(rumor)) {
                                        neighbor.newRumors[rumor] = Math.random() < lambda ? "spreader" : "stifler";
                                    } else if (neighbor.rumors[rumor] == "spreader") {
                                        neighbor.newRumors[rumor] = Math.random() > gamma ? "spreader" : "stifler";
                                    }
                                } else if (node.rumors[rumor] == "stifler" && neighbor.rumors[rumor] == "spreader") {
                                    neighbor.newRumors[rumor] = Math.random() > eta ? "spreader" : "stifler";
                                }
                            } else if (Math.random() < delta) {
                                // probability that node forgets rumor
                                node.newRumors[rumor] = "stifler";
                            }
                            rumorAge++;
                        });
                    }
                });
            });
        
            Object.keys(rumorStates).forEach(function(r) {
                rumorStates[r].ignorant = totalIndividuals;
                rumorStates[r].spreading = 0;
                rumorStates[r].stifling = 0;
            })
            // update graph data
            graph_data.nodes.forEach(function(node) {
            
                Object.keys(node.newRumors).forEach(function(rumor) {
                    node.rumors[rumor] = node.newRumors[rumor];
                });
                node.newRumors = {};
            
               // count number of active rumors
                node.spreading = 0;
                node.stifling = 0;
                Object.keys(node.rumors).forEach(function(r) {
                
                    if (node.rumors[r] == "spreader") {
                        rumorStates[r].spreading++;
                        rumorStates[r].ignorant--;
                        //node.spreading += 1 / Math.pow(rumor - r, 2);
                        node.spreading += 1;
                    } else if (node.rumors[r] == "stifler") {
                        rumorStates[r].stifling++;
                        rumorStates[r].ignorant--;
                        node.stifling += 1 / Math.pow(rumor - r, 2);
                    }
                });
            
                if (node.id == activeNode) {
                    tooltip.html(function(d) {
                        var text = "<ul>";
                        Object.keys(node.rumors).reverse().forEach(function(rumor) {
                            text += "<li class=\"" + node.rumors[rumor] + "\">" + 
                                rumor + " " + node.rumors[rumor] + "</li>";
                        })
                        return text; 
                    })
                }
            });
        
            setNodeFill(nodes);
        
            // update chart data
            Object.keys(charts).forEach(function(r) {
            
                chart = charts[r];
            
                chart.data.ignorant.push({"iter": iter, "count": rumorStates[r].ignorant});
                chart.data.spreading.push({"iter": iter, "count": rumorStates[r].spreading});
                chart.data.stifling.push({"iter": iter, "count": rumorStates[r].stifling});
            
                chart.x.domain([iter - 20, iter]);
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
        
    setNodeFill(nodes) {
        nodes.style("fill", function(node) { 
            if (selectedRumor == -1) {
                return d3.interpolateReds(Math.pow(1 - (1 / Math.pow(2, node.spreading)), 2));
            } else if (node.rumors[selectedRumor] == "spreader") {
                return "#E57373";
            } else if (node.rumors[selectedRumor] == "stifler") {
                return "#81C784";
            } else {
                return d3.interpolateReds(0);
            }
        });
    }

    update = (props) => {

    }
}

module.exports = Graph;