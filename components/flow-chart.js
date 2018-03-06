const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');

class FlowChart extends D3Component {

    initialize(node, props) {

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

            "lambda": {
                "data": [
                    {"x": flow.x(0.25) + 40, "y": flow.y(0.5)},
                    {"x": flow.x(0.5) - 40, "y": flow.y(0.5)},
                ],
                "text": "Spreader",
                "symbol": "λ",
                "x": flow.x(3/8),
                "y": flow.y(3/8)
            },

            "oneMinusLambda": {
                "data": [
                    {"x": flow.x(0.25), "y": flow.y(0.5) + 25/2},
                    {"x": flow.x(0.25), "y": flow.y(0.5) + 60},
                    {"x": flow.x(0.75) + 80/4, "y": flow.y(0.5) + 60},
                    {"x": flow.x(0.75) + 80/4, "y": flow.y(0.5) + 25/2}
                ],
                "text": "Spreader",
                "symbol": "1 - λ",
                "x": flow.x(3/8),
                "y": flow.y(3/4)
            },

            "eta": {
                "data": [
                    {"x": flow.x(0.5), "y": flow.y(0.5) - 25/2},
                    {"x": flow.x(0.5), "y": flow.y(0.5) - 40},
                    {"x": flow.x(0.75), "y": flow.y(0.5) - 40},
                    {"x": flow.x(0.75), "y": flow.y(0.5) - 25/2}
                ],
                "text": "Spreader",
                "symbol": "η",
                "x": flow.x(5/8),
                "y": flow.y(1/8)
            },

            "gamma": {
                "data": [
                    {"x": flow.x(0.5) + 40, "y": flow.y(0.5)},
                    {"x": flow.x(0.75) - 40, "y": flow.y(0.5)},
                ],
                "text": "Spreader",
                "symbol": "γ",
                "x": flow.x(5/8),
                "y": flow.y(3/8)
             },

            "delta": {
                "data": [
                    {"x": flow.x(0.5), "y": flow.y(0.5) + 25/2},
                    {"x": flow.x(0.5), "y": flow.y(0.5) + 40},
                    {"x": flow.x(0.75) - 80/4, "y": flow.y(0.5) + 40},
                    {"x": flow.x(0.75) - 80/4, "y": flow.y(0.5) + 25/2},
                ],
                "text": "Spreader",
                "symbol": "δ",
                "x": flow.x(5/8),
                "y": flow.y(5/8)
             }
        };
        console.log("17");

        Object.keys(flow.params).forEach(function(p) {
            const param = flow.params[p];

            flow.svg.append("path")
                .attr("stroke", "#000")
                .attr("marker-end", "url(#arrow)")
                .attr("stroke-width", "1px")
                .attr("fill", "none")
                .datum(param.data)
                .attr("d", flow.line);

            flow.svg.append("text")
                .attr("x", param.x)
                .attr("y", param.y)
                .attr("dy", "0.4em")
                .attr("text-anchor", "middle")
                .text(param.symbol)
                .on("click", function(d) {
                    console.log(d3.event.pageX);
                    console.log(d3.event.pageY);
                    flow.paramSlider
                        .attr("opacity", 1)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px");
                });
        });

        this.svg = flow
    }

    update(props) {
        console.log("update");
    }
}

export default FlowChart;
