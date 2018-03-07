import React from 'react';
import CustomD3Component from "./custom-d3-component";
import FlowChart from "./flow-chart.js";
import MathJaxComponent from "./math-jax-component.js";
import Graph from "./graph.js";

const equation1Text = String.raw`
$$\cos (2\theta) = \cos^2 \theta - \sin^2 \theta$$

$$\cos (2\theta) = \cos^2 \theta - \sin^2 \theta$$

$$\lim_{x \to \infty} \exp(-x) = 0$$

$$k_{n+1} = n^2 + k_n^2 - k_{n-1}$$

$$k_{n+1} = n^2 + k_n^2 - k_{n-1}$$
`;

const equation2Text = String.raw`
$$\cos (2\theta) = \cos^2 \theta - \sin^2 \theta$$
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
      case 0: {
        return (
            <div>0</div>
        )
      }
      case 1: {
        return (<div></div>)
      }
      case 2: {
        return (
          <FlowChart />
        )
      }
      case 3: {
        return (<MathJaxComponent tex={mean_field1} />)
      }
      case 4: {
        return (<Graph />)
      }
      default: {
        return (
            <CustomD3Component />
        )
      }
    }
  }
}

export default SidePanel;
