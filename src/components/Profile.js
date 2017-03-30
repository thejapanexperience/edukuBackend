import React, { Component } from 'react';
import { connect } from 'react-redux';
import {ButtonToolbar, Button} from 'react-bootstrap'


class Profile extends Component {
  render() {
    return (
      <div>
        <h3>Profile</h3>
        { JSON.stringify(this.props.profile) }

        <hr />

        <ButtonToolbar>
          <Button bsStyle="primary">Send JWT to Express</Button>
        </ButtonToolbar>
      </div>
    );
  }
}

export default connect(
  state => ({ profile: state.profile }),
  null,
)(Profile);
