export default (state = true, action) => {
  switch (action.type) {
    case 'CREATE_CHILD_USER_FULFILLED':
      return true;
    case 'CREATE_CHILD_USER_REJECTED':
      return false;
    default:
      return state;
  }
};
