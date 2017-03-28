import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as ContactActions from '../actions/ContactActions';

class ContactTable extends Component {
  constructor() {
    super();
    this.state = {
      nameSort: false,
      nameCurr: false,
      relationSort: false,
      relationCurr: false,
    };
  }

  nameSort = () => {
    const { nameSort, nameCurr } = this.state;

    if (nameCurr) {
      if (nameSort) {
        this.setState({ nameSort: false, nameCurr: false });
      } else {
        this.setState({ nameSort: true });
      }
    } else {
      this.setState({ nameCurr: true });
    }
  }

  relationSort = () => {
    const { relationSort, relationCurr } = this.state;

    if (relationCurr) {
      if (relationSort) {
        this.setState({ relationSort: false, relationCurr: false });
      } else {
        this.setState({ relationSort: true });
      }
    } else {
      this.setState({ relationCurr: true });
    }
  }

  render() {
    const { openEdit, removeContact, search, contacts } = this.props;
    const { nameCurr, nameSort, relationCurr, relationSort } = this.state;
    let displayContacts = [...contacts];

    const nameStyle = {
      color: null,
      className: 'sort-by-attributes',
    };
    const relationStyle = {
      color: null,
      className: 'sort-by-attributes',
    };

    if (search) {
      displayContacts = displayContacts.filter(contact => contact.name.toLowerCase().includes(search));
    }

    if (nameCurr) {
      nameStyle.color = { color: 'red' };
      displayContacts = displayContacts.sort((a, b) => {
        if (nameSort) {
          nameStyle.className = 'sort-by-attributes-alt';
          const save = b.name.toLowerCase();
          b = a.name.toLowerCase();
          a = save;
        } else {
          a = a.name.toLowerCase();
          b = b.name.toLowerCase();
        }

        if (a < b) return -1;
        else if (a > b) return 1;

        return 0;
      });
    }

    if (relationCurr) {
      relationStyle.color = { color: 'red' };
      displayContacts = displayContacts.sort((a, b) => {
        if (relationSort) {
          relationStyle.className = 'sort-by-attributes-alt';
          const save = b.relation.toLowerCase();
          b = a.relation.toLowerCase();
          a = save;
        } else {
          a = a.relation.toLowerCase();
          b = b.relation.toLowerCase();
        }

        if (a < b) return -1;
        else if (a > b) return 1;

        return 0;
      });
    }

    return (
      <table className='table table-hover'>
        <thead>
          <tr>
            <th>
              Name&nbsp;
              <a onClick={this.nameSort}>
                <span
                  style={nameStyle.color}
                  className={`glyphicon glyphicon-${nameStyle.className}`}
                />
              </a>
            </th>
            <th>Phone</th>
            <th>
              Relation&nbsp;
              <a onClick={this.relationSort}>
                <span
                  style={relationStyle.color}
                  className={`glyphicon glyphicon-${relationStyle.className}`}
                />
              </a>
            </th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {displayContacts.map(contact =>(
            <tr key={contact.id}>
              <td>{contact.name}</td>
              <td>{contact.phone}</td>
              <td>{contact.relation}</td>
              <td>
                <button
                  className="btn btn-default"
                  onClick={() => openEdit(contact)}
                >
                  Edit
                </button>
              </td>
              <td>
                <button
                  className="btn btn-default"
                  onClick={() => removeContact(contact.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default connect(
  state => ({ contacts: state.contacts }),
  dispatch => ({
    removeContact(id) { dispatch(ContactActions.removeContact(id)); },
  })
)(ContactTable);
