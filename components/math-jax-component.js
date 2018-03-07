import React from 'react';
import MathJax from "react-mathjax-preview";

class MathJaxComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      loaded: false,
    }
  }

  componentDidMount = () => {
    setTimeout(() => {
      this.setState({loaded: true});
    }, 100);
  }

  render() {
    const { hasError, updateProps, tex, ...props } = this.props;
    let jaxClass = this.state.loaded ? "" : "mathHidden";
    return (
          <div {...props}>
              {this.state.loaded === false &&
                <div>Loading math...</div>
              }
              <div className={jaxClass}>
                <MathJax math={tex} />
              </div>
          </div>
      );
  }
}

export default MathJaxComponent;
