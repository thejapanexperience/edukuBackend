export default (state = true, action) => {
  switch (action.type) {
    case 'INIT_FROM_LOCK_FULFILLED':
      return true;
    case 'INIT_FROM_LOCK_REJECTED':
      return false;
    default:
      return state;
  }
};
