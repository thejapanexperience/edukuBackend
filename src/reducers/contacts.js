export default (state = [], action) => {
  switch (action.type) {
    case 'ADD_CONTACT':
      return [...state, action.contact];
    case 'UPDATE_CONTACT':
      return state.map((contact) => {
        if (contact.id === action.contact.id) {
          return Object.assign({}, contact, action.contact);
        }
        return contact;
      });
    case 'REMOVE_CONTACT':
      return state.filter(contact => contact.id !== action.id);
    default:
      return state;
  }
};
