import React, { Component } from 'react';
import { Link } from 'react-router';

export default class Layout extends Component {
  render() {
    return (
      <div className="container">
        <h1 className="text-center">Welcome</h1>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/management">Management</Link></li>
        </ul>
        <hr />
        {this.props.children}
      </div>
    );
  }
}
