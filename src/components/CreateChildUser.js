import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ButtonToolbar, Button, FormGroup, FormControl, ControlLabel, Form } from 'react-bootstrap';
import uuid from 'uuid';

import * as ApiActions from '../actions/ApiActions';

class CreateChildUser extends Component {
  constructor() {
    super();

    this.state = {
      users: [true],
      passwords: [true],
      types: [true],

    };
  }

  createNewUsers = () => {
    const { createChildUser, auth } = this.props;

    const newUsers = this.state.users.map((e, index) => {
      const user = this.refs[`user${index}`].value;
      return {
        email: `${user}@mail.com`,
        name: user,
        username: user,
        password: this.refs[`password${index}`].value,
        role: this.refs[`type${index}`].value,
      };
    });

    createChildUser(auth.getAccessToken(), newUsers);

    this.setState({
      users: [true],
      passwords: [true],
      types: [true],
    });
  }

  repopulate = () => {
    let users = [];
    let passwords = [];
    let types = [];

    this.state.users.forEach((e, index) => {
      users.push(this.refs[`user${index}`].value);
    });

    this.state.passwords.forEach((e, index) => {
      passwords.push(this.refs[`password${index}`].value);
    });

    this.state.types.forEach((e, index) => {
      types.push(this.refs[`type${index}`].value);
    });

    setTimeout(() => {
      users.forEach((element, index) => {
        this.refs[`user${index}`].value = element;
      });

      passwords.forEach((element, index) => {
        this.refs[`password${index}`].value = element;
      });

      types.forEach((element, index) => {
        this.refs[`type${index}`].value = element;
      });
    }, 1);
  }

  addUser = () => {
    this.repopulate();

    this.setState({
      users: [...this.state.users,true],
      passwords: [...this.state.passwords,true],
      types: [...this.state.types,true]
    });
  }

  render() {
    const newUserInputs = this.state.users.map((element, index) => (
      <div key={uuid()}>
        <input ref={`user${index}`} />
        <input ref={`password${index}`} defaultValue={'password'/* uuid().substr(0,8) */} />
        <select ref={`type${index}`}>
          <option value="student">student</option>
          <option value="parent">parent</option>
          <option value="administrator">administrator</option>
          <option value="educator">educator</option>
          <option value="other">other</option>
        </select>
      </div>
    ));


    return (
      <div>
        <h3>Create Child User</h3>

        <hr />

        {newUserInputs}

        <br />

        <ButtonToolbar>
          <Button onClick={this.createNewUsers} bsStyle="primary">Create New Users</Button>
          <Button onClick={this.addUser} bsStyle="primary">+</Button>
        </ButtonToolbar>

        <hr />

        <h3>
          {this.props.createChildUserStatus ? 'CREATION SUCCESS' : 'FAILED CREATION'}
        </h3>
      </div>
    );
  }
}

export default connect(
  state => ({
    createChildUserStatus: state.createChildUser,
    profile: state.profile,
  }),
  dispatch => ({
    createChildUser(jwt, newUsers) {
      dispatch(ApiActions.createChildUser(jwt, newUsers));
    },
  }),
)(CreateChildUser);
