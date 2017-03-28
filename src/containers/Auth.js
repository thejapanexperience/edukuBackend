import React from 'react';
import Layout from '../components/Layout';

export default class Container extends React.Component {
  render() {
    let children = null;

    if (this.props.children) {
      children = React.cloneElement(
        this.props.children,
        { auth: this.props.route.auth },
      );
    }

    return (
      <div>
        {children}
      </div>
    );
  }
}
