import React from 'react';
import CustomD3Component from "./custom-d3-component";

class SidePanel extends React.Component {
  constructor() {
    super()
    this.state = {
      v: "none",
    }
  }
  render() {
    let view = this.props.view;
    switch(view) {
      case 0: {
        return (<div>none</div>)
      }
      case 1: {
        return (<div>first</div>)
      }
      case 2: {
        return (<div>second</div>)
      }
      case 3: {
        return (<div>third</div>)
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
