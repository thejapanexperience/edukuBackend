export default (state = 'NO VALIDATION ATTEMPT', action) => {
  switch (action.type) {
    case 'VALIDATE_JWT_FULFILLED':
      return 'VALID';
    case 'VALIDATE_JWT_REJECTED':
      return 'INVALID';
    default:
      return state;
  }
};
