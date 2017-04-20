import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ButtonToolbar, Button, FormGroup, FormControl, ControlLabel, Form } from 'react-bootstrap';
import uuid from 'uuid';

import * as ApiActions from '../actions/ApiActions';

class GetChildUser extends Component {
  componentWillMount() {
    const { getChildUser, auth } = this.props;
    getChildUser(auth.getAccessToken());
  }

  render() {
    return (
      <div>
        <h3>Get Child User</h3>

        <hr />
        {JSON.stringify(this.props.childUsers)}
      </div>
    );
  }
}

export default connect(
  state => ({
    childUsers: state.getChildUser,
  }),
  dispatch => ({
    getChildUser(jwt) {
      dispatch(ApiActions.getChildUser(jwt));
    },
  }),
)(GetChildUser);
