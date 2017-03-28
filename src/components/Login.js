import React, { Component } from 'react';
import {ButtonToolbar, Button} from 'react-bootstrap'

export default class Login extends Component {
  logout = () => {
    const { auth, router } = this.props;
    auth.logout();
    router.push('/');
  }

  render() {
    const { auth } = this.props;
    const loggedIn = auth.loggedIn();
    return (
      <div>
        <h3>Login</h3>
        <ButtonToolbar>
          <Button bsStyle={loggedIn ? "primary" : "default"} disabled={loggedIn} onClick={auth.login.bind(this)}>Login</Button>
          <Button bsStyle={loggedIn ? "default" : "primary"} disabled={!loggedIn} onClick={this.logout}>Logout</Button>
        </ButtonToolbar>
      </div>
    );
  }
}
