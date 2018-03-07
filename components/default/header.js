import React from 'react';

class Header extends React.PureComponent {
  getAuthorTags() {
    return this.props.authors.map((author, idx) => {
      let end = ","
      if (idx === this.props.authors.length - 1) {
        end = ""
      }
      return (
        <span key={author.name}><a target="_blank" href={author.link}>{author.name}</a>{end} </span>
      );
    });
  }
  render() {
    let authors = this.getAuthorTags();
    return (
      <div className={'article-header'}>
        <h1 className={'hed'}>
          {this.props.title}
        </h1>
        {
          this.props.subtitle && (
            <h2 className={'dek'}>
              {this.props.subtitle}
            </h2>
          )
        }
        {
          this.props.authors && (
            <div className={'byline'}>
              By: {authors}
            </div>
          )
        }
      </div>
    );
  }
}

export default Header;
