const D3Component = require('idyll-d3-component');
const d3 = require('d3');

class FlowChart extends D3Component {

    initialize(node, props) {

        var width = 600; 
        var height = 150;

        var rectWidth = 80;
        var rectHeight = 25;
        var svg = d3.select(node).append("svg")
            .attr("width", width)
            .attr("height", height);
      
        var defs = svg.append("defs");
        
        var arrow = defs
            .append("marker")
                .attr("id", "arrow")
                .attr("refX", 6)
                .attr("refY", 2)
                .attr("markerWidth", 10)
                .attr("markerHeight", 10)
                .attr("orient", "auto")
            .append("path")
                .attr("d", "M0,0 L0,4 L6,2 z")
                .style("stroke", "black")
                .style("stroke-width", "1px")
                .style("marker-end", "url(#arrow)")
                .style("fill", "#000");
        
        var ignorant = svg.append("g")
            .attr("transform", "translate(" + 
                (width / 4) + "," + 
                (height / 2) + ")");
        
        ignorant.append("rect")
            .attr("x", -rectWidth/2)
            .attr("y", -rectHeight/2)
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .style("stroke", "black")
            .style("fill", "none");
        
        ignorant.append("text")
            .attr("id", "ignorant")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", "0.4em")
            .attr("text-anchor", "middle")
            .text("Ignorant");
        
        var spreader = svg.append("g")
            .attr("transform", "translate(" + 
                (width / 2) + "," + 
                (height / 2) + ")");
        
        spreader.append("rect")
            .attr("x", -rectWidth/2)
            .attr("y", -rectHeight/2)
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .style("stroke", "black")
            .style("fill", "none");

        spreader.append("text")
            .attr("id", "spreader")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", "0.4em")
            .attr("text-anchor", "middle")
            .text("Spreader");
        
        var stifler = svg.append("g")
            .attr("transform", "translate(" + 
                (3 * width / 4) + "," + 
                (height / 2) + ")");
        
        stifler.append("rect")
            .attr("x", -rectWidth/2)
            .attr("y", -rectHeight/2)
            .attr("width", rectWidth)
            .attr("height", rectHeight)
            .style("stroke", "black")
            .style("fill", "none");

       stifler.append("text")
            .attr("id", "stifler")
            .attr("x", 0)
            .attr("y", 0)
            .attr("dy", "0.4em")
            .attr("text-anchor", "middle")
            .text("Stifler");
        
        var x = d3.scaleLinear()
            .range([0, width])
            .domain([0, 1]);
        
        var y = d3.scaleLinear()
            .range([0, height])
            .domain([0, 1]);
        
        var line = d3.line()
            .x((d) => { return d.x; })
            .y((d) => { return d.y; });
       
        var params = {
        
            "lambda": {
                "data": [
                    {"x": x(0.25) + rectWidth/2, "y": y(0.5)},
                    {"x": x(0.5) - rectWidth/2, "y": y(0.5)},
                ],
                "text": "Spreader",
                "symbol": "λ",
                "x": x(3/8),
                "y": y(1/2)
            },
        
            "oneMinusLambda": {
                "data": [
                    {"x": x(1/4), "y": y(1/2) + rectHeight/2},
                    {"x": x(1/4), "y": y(7/8) },
                    {"x": x(3/4) + rectWidth/4, "y": y(7/8) },
                    {"x": x(3/4) + rectWidth/4, "y": y(1/2) + rectHeight/2 }
                ],
                "text": "Spreader",
                "symbol": "1 - λ",
                "x": x(3/8),
                "y": y(7/8)
            },
        
            "eta": {
                "data": [
                    {"x": x(1/2), "y": y(1/2) - rectHeight/2},
                    {"x": x(1/2), "y": y(1/4) },
                    {"x": x(3/4), "y": y(1/4) },
                    {"x": x(3/4), "y": y(1/2) - rectHeight/2},
                ],
                "text": "Spreader",
                "symbol": "η",
                "x": x(5/8),
                "y": y(1/4)
            },
        
            "gamma": {
                "data": [
                    {"x": x(1/2) + rectWidth/2, "y": y(1/2)},
                    {"x": x(3/4) - rectWidth/2, "y": y(1/2)},
                ],
                "text": "Spreader",
                "symbol": "γ",
                "x": x(5/8),
                "y": y(1/2)
             },
         
            "delta": {
                "data": [
                    {"x": x(1/2), "y": y(1/2) + rectHeight/2},
                    {"x": x(1/2), "y": y(3/4)},
                    {"x": x(3/4) - rectWidth/4, "y": y(3/4)},
                    {"x": x(3/4) - rectWidth/4, "y": y(1/2) + rectHeight/2},
                ],
                "text": "Spreader",
                "symbol": "δ",
                "x": x(5/8),
                "y": y(3/4)
             }
        };
    
        Object.keys(params).forEach(function(p) {
            var param = params[p];
        
            svg.append("path")
                .attr("stroke", "#000")
                .attr("marker-end", "url(#arrow)")
                .attr("stroke-width", "1px")
                .attr("fill", "none")
                .datum(param.data)
                .attr("d", line);
        
            svg.append("text")
                .attr("x", param.x)
                .attr("y", param.y)
                .attr("dy", "-0.7em")
                .attr("text-anchor", "middle")
                .text(param.symbol)
                .on("click", function(d) {
                    console.log(d3.event.pageX);
                    console.log(d3.event.pageY);
                    paramSlider
                        .attr("opacity", 1)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");
                });
        });

    }

    update(props) {
        console.log("update");
    }
}    

module.exports = FlowChart;