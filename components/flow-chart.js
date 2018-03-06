const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

class FlowChart extends D3Component {

    initialize(node, props) {

<<<<<<< HEAD
        console.log("hello");
        console.log(node);
        console.log(props);
        const width = 400;
        const height = 150;

        const nameWidth = 80;
        const nameHeight = 25;

        const flow = d3.select(node).append("svg");
        // flow.style("width", 400) // node.parentNode.attr("width");
        // flow.style("height", 150)
        console.log("1");
        console.log(flow);
        flow.svg = d3.select("#flowchart").append("svg")
            .style("width", width)
            .style("height", height);

        console.log("2");

        flow.defs = flow.svg.append("defs");

        console.log("3");

        flow.arrow = flow.defs
=======
        var width = 600; 
        var height = 150;

        var rectWidth = 80;
        var rectHeight = 25;
        var svg = d3.select(node).append("svg")
            .attr("width", width)
            .attr("height", height);
      
        var defs = svg.append("defs");
        
        var arrow = defs
>>>>>>> bf557e881aa60007f1c2cc332e4e2dd096666b84
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
<<<<<<< HEAD

        console.log("4");

        flow.ignorant = flow.svg.append("g")
            .attr("transform", "translate(" +
                (width / 4) + "," +
                (height / 2) + ")")
            .style("width", 80)
            .style("", 15);

        console.log("5");

        flow.ignorant.append("rect")
            .attr("x", -40)
            .attr("y", -12.5)
            .attr("width", 80)
            .attr("height", 25)
            .style("stroke", "black")
            .style("fill", "none");

      console.log("6");


        flow.ignorant.append("text")
            .attr("id", "ignorant")
            .attr("x", nameWidth / 2)
            .attr("y", nameHeight / 2)
            .attr("dy", "0.4em")
            .attr("text-anchor", "middle")
            .text("Ignorant");

        console.log("7");


        flow.spreader = flow.svg.append("g")
            .attr("transform", "translate(" +
                (width / 2) + "," +
                (height / 2) + ")");

                console.log("8");


        flow.spreader.append("rect")
            .attr("x", -40)
            .attr("y", -12.5)
            .attr("width", 80)
            .attr("height", 25)
            .style("stroke", "black")
            .style("fill", "none");

            console.log("9");


        flow.spreader.append("text")
            .attr("id", "ignorant")
            .attr("x", nameWidth / 2)
            .attr("y", nameHeight / 2)
            .attr("dy", "0.4em")
            .attr("text-anchor", "middle")
            .text("Spreader");

            console.log("10");


        flow.stifler = flow.svg.append("g")
            .attr("transform", "translate(" +
                (3 * width / 4) + "," +
                (height / 2) + ")");
                console.log("11");

        flow.stifler.append("rect")
            .attr("x", -40)
            .attr("y", -12.5)
            .attr("width", 80)
            .attr("height", 25)
            .style("stroke", "black")
            .style("fill", "none");
            console.log("12");

        flow.stifler.append("text")
            .attr("id", "ignorant")
            .attr("x", nameWidth / 2)
            .attr("y", nameHeight / 2)
            .attr("dy", "0.4em")
            .attr("text-anchor", "middle")
            .text("Stifler");
            console.log("13");

        flow.x = d3.scaleLinear()
            .range([0, width])
            .domain([0, 1]);
            console.log("14");

        flow.y = d3.scaleLinear()
            .range([0, height])
            .domain([0, 1]);
            console.log("15");

        flow.line = d3.line()
            .x((d) => { return d.x; })
            .y((d) => { return d.y; });
            console.log("16");

        flow.params = {

=======
        
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
        
>>>>>>> bf557e881aa60007f1c2cc332e4e2dd096666b84
            "lambda": {
                "data": [
                    {"x": x(0.25) + 40, "y": y(0.5)},
                    {"x": x(0.5) - 40, "y": y(0.5)},
                ],
                "text": "Spreader",
                "symbol": "λ",
                "x": x(3/8),
                "y": y(3/8)
            },

            "oneMinusLambda": {
                "data": [
                    {"x": x(0.25), "y": y(0.5) + 25/2},
                    {"x": x(0.25), "y": y(0.5) + 60},
                    {"x": x(0.75) + 80/4, "y": y(0.5) + 60},
                    {"x": x(0.75) + 80/4, "y": y(0.5) + 25/2}
                ],
                "text": "Spreader",
                "symbol": "1 - λ",
                "x": x(3/8),
                "y": y(3/4)
            },

            "eta": {
                "data": [
                    {"x": x(0.5), "y": y(0.5) - 25/2},
                    {"x": x(0.5), "y": y(0.5) - 40},
                    {"x": x(0.75), "y": y(0.5) - 40},
                    {"x": x(0.75), "y": y(0.5) - 25/2}
                ],
                "text": "Spreader",
                "symbol": "η",
                "x": x(5/8),
                "y": y(1/8)
            },

            "gamma": {
                "data": [
                    {"x": x(0.5) + 40, "y": y(0.5)},
                    {"x": x(0.75) - 40, "y": y(0.5)},
                ],
                "text": "Spreader",
                "symbol": "γ",
                "x": x(5/8),
                "y": y(3/8)
             },

            "delta": {
                "data": [
                    {"x": x(0.5), "y": y(0.5) + 25/2},
                    {"x": x(0.5), "y": y(0.5) + 40},
                    {"x": x(0.75) - 80/4, "y": y(0.5) + 40},
                    {"x": x(0.75) - 80/4, "y": y(0.5) + 25/2},
                ],
                "text": "Spreader",
                "symbol": "δ",
                "x": x(5/8),
                "y": y(5/8)
             }
        };
<<<<<<< HEAD
        console.log("17");

        Object.keys(flow.params).forEach(function(p) {
            const param = flow.params[p];

            flow.svg.append("path")
=======
    
        Object.keys(params).forEach(function(p) {
            var param = params[p];
        
            svg.append("path")
>>>>>>> bf557e881aa60007f1c2cc332e4e2dd096666b84
                .attr("stroke", "#000")
                .attr("marker-end", "url(#arrow)")
                .attr("stroke-width", "1px")
                .attr("fill", "none")
                .datum(param.data)
<<<<<<< HEAD
                .attr("d", flow.line);

            flow.svg.append("text")
=======
                .attr("d", line);
        
            svg.append("text")
>>>>>>> bf557e881aa60007f1c2cc332e4e2dd096666b84
                .attr("x", param.x)
                .attr("y", param.y)
                .attr("dy", "0.4em")
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

<<<<<<< HEAD
        this.svg = flow
=======
>>>>>>> bf557e881aa60007f1c2cc332e4e2dd096666b84
    }

    update(props) {
        console.log("update");
    }
}

export default FlowChart;
