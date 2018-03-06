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
        return (
          <FlowChart />
        )
      }
      case 2: {
        return (<MathJaxComponent tex={equation1Text} />)
      }
      case 3: {
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
