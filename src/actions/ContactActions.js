export const addContact = contact => ({ type: 'ADD_CONTACT', contact });
export const updateContact = contact => ({ type: 'UPDATE_CONTACT', contact });
export const removeContact = id => ({ type: 'REMOVE_CONTACT', id });
