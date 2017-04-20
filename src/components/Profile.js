import React, { Component } from 'react';
import { connect } from 'react-redux';
import {ButtonToolbar, Button} from 'react-bootstrap'

import * as ApiActions from '../actions/ApiActions';

class Profile extends Component {
  validateJwt = () => {
    const { validateJwt, auth } = this.props;
    validateJwt(auth.getAccessToken());
  }

  render() {
    const { profile, isJwtValid } = this.props;

    return (
      <div>
        <h3>Profile</h3>
        { JSON.stringify(profile) }

        <hr />

        <ButtonToolbar>
          <Button onClick={this.validateJwt} bsStyle="primary">Send JWT to Express</Button>
        </ButtonToolbar>

        <hr />

        <h3>
          {isJwtValid}
        </h3>
      </div>
    );
  }
}

export default connect(
  state => ({
    profile: state.profile,
    isJwtValid: state.validateJwt,
  }),
  dispatch => ({
    validateJwt(jwt) {
      dispatch(ApiActions.validateJwt(jwt));
    },
  }),
)(Profile);
