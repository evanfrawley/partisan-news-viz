const React = require('react');

class CustomComponent extends React.Component {
  render() {
    const { hasError, updateProps, children, ...props } = this.props;
    return (
      <div className="quote" {...props}>
        {children}
      </div>
    );
  }
}

module.exports = CustomComponent;
