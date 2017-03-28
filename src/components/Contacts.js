import React, { Component } from 'react';

import ContactModal from './ContactModal';
import ContactTable from './ContactTable';

export default class Contacts extends Component {
  constructor() {
    super();
    this.state = {
      open: null,
      openEdit: null,
      search: '',
    };
  }

  onChange = () => {
    const { search } = this.refs;
    this.setState({ search: search.value });
  }

  getOpen = (open) => {
    this.setState({ open });
  }

  getOpenEdit = (openEdit) => {
    this.setState({ openEdit });
  }

  render() {
    const { open, openEdit, search } = this.state;
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                onChange={this.onChange}
                ref="search"
                placeholder="enter name..."
              />
              <span className="input-group-btn">
                <button className="btn btn-default" type="button">Search Contacts</button>
              </span>
            </div>
          </div>
          <div className="col-md-5" />
          <div className="col-md-3">
            <button className="btn btn-default" onClick={open}>
              New Contact
            </button>
          </div>
        </div>
        <ContactModal
          getOpen={this.getOpen}
          getOpenEdit={this.getOpenEdit}
        />
        <hr />
        <ContactTable
          openEdit={openEdit}
          search={search}
        />
      </div>
    );
  }
}
