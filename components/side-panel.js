import React from 'react';
import CustomD3Component from "./custom-d3-component";
import FlowChart from "./flow-chart.js";
import MathJaxComponent from "./math-jax-component.js";
import Equation from "./default/equation.js";
import Graph from "./graph.js";

const disneyCDN = "https://cdn.discordapp.com/attachments/417909825096122378/421049879767416842/disneyonice.jpg";

const equation1Text = String.raw`
$$\frac{dI(t)}{d(t)} = -\bar{k}I(t)S(t)$$
`;

const equation2Text = String.raw`
$$\frac{dS(t)}{d(t)} = \lambda \bar{k} I(t)S(t) - \bar{k} S(t) ( \gamma S(t) + \eta R(t)) - \delta S(t)$$
`;

const equation3Text = String.raw`
$$\frac{dR(t)}{d(t)} = (1 - \lambda)\bar{k}I(t)S(t) + \bar{k}S(t)(\gamma S(t) + \eta R(t)) + \delta S(t)$$
`;

const mean_field1 = String.raw`
$$\frac{dI(t)}{dt} = -\bar{k}I(t)S(t)$$

$$\frac{dS(t)}{dt} = \lambda\bar{k}I(t)S(t) - \bar{k}S(t)(\gamma S(t) + \eta R(t)) − \delta S(t)$$

$$\frac{dR(t)}{dt} = (1 - \lambda) \bar{k}I(t)S(t) + \bar{k}S(t)(\gamma S(t) + \eta R(t)) + \delta S(t)$$
`;

class SidePanel extends React.Component {
  render() {
    let view = this.props.view;
    switch(view) {
      case "initial": {
        return (
            <div className="flexContainer">
              <img className="disneyImg" alt="disney on ice rumor example" src={disneyCDN} />
            </div>
        )
      }
      case 1: {
        return (<div></div>)
      }
      case "flowchart": {
        return (
          <FlowChart />
        )
      }
      case "psuedocode": {
        return (
          <div>
            <pre>
            {`
  for node in nodes:
     for nbr in node.neighbors:
        if 1/(len(node.neighbors)^0.5) > random():
           for idx, rumor in enumerate(node.rumors):
              if 1/(2^idx) > random():
                 interact(node, nbr, rumor)
`}
            </pre>
          </div>
        )
      }
      case "equations": {
        return (
          <div>
            <MathJaxComponent tex={mean_field1} />
          </div>
        )
      }
      case "sliders": {
        return (
          <div id="graph-container" height="800"><Graph
            gamma={this.props.gamma}
            delta={this.props.delta}
            eta={this.props.eta}
            lambda={this.props.lambda }
            cluster={this.props.cluster}
            density={this.props.density}
          /></div>
        )
      }
      default: {
        return (null)
      }
    }
  }
}

export default SidePanel;
