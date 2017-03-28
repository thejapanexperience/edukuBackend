import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import uuid from 'uuid';

import * as ContactActions from '../actions/ContactActions';

class ContactModal extends Component {
  constructor() {
    super();
    this.state = {
      showModal: false,
      name: '',
      phone: '',
      relation: '',
      id: '',
    };
  }

  componentWillMount() {
    const { getOpen, getOpenEdit } = this.props;
    getOpen(this.open);
    getOpenEdit(this.openEdit);
  }

  onChange = () => {
    const { name, phone, relation } = this.refs;
    this.setState({
      name: name.value,
      phone: phone.value,
      relation: relation.value,
    });
  }

  close = () => {
    this.setState({
      showModal: false,
      name: '',
      phone: '',
      relation: '',
      id: '',
    });
  }

  open = () => {
    this.setState({ showModal: true });
  }

  openEdit = (contact) => {
    this.setState({
      showModal: true,
      name: contact.name,
      phone: contact.phone,
      relation: contact.relation,
      id: contact.id,
    });
  }

  save = () => {
    const { name, phone, id, relation } = this.state;
    const { addContact, updateContact } = this.props;

    if (id) {
      updateContact({ name, phone, relation, id });
    } else {
      addContact({ name, phone, relation, id: uuid() });
    }

    this.close();
  }


  render() {
    const { name, phone, relation, id } = this.state;

    return (
      <div className='container'>
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>{id ? 'Edit Contact' : 'New Contact'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>Name:</h5>
            <input
              className="form-control"
              onChange={this.onChange}
              type="text" value={name}
              ref="name"
              placeholder="enter name"
            />
            <h5>Phone:</h5>
            <input
              className="form-control"
              onChange={this.onChange}
              type="text"
              value={phone}
              ref="phone"
              placeholder="enter phone"
            />
            <h5>Relation:</h5>
            <input
              className="form-control"
              onChange={this.onChange}
              type="text" value={relation}
              ref="relation"
              placeholder="enter relation"
            />
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-default" onClick={this.close}>Close</button>
            <button className="btn btn-default" onClick={this.save}>Save</button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default connect(
  null,
  dispatch => ({
    addContact(contact) { dispatch(ContactActions.addContact(contact)); },
    updateContact(contact) { dispatch(ContactActions.updateContact(contact)); },
  })
)(ContactModal);
