export default (state = [], action) => {
  switch (action.type) {
    case 'GET_CHILD_USER_FULFILLED':
      return action.payload.data;
    case 'GET_CHILD_USER_REJECTED':
      return state;
    default:
      return state;
  }
};
