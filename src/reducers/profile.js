export default (state = {}, action) => {
  switch (action.type) {
    case 'PROFILE_LOAD':
      console.log('action.profile: ', action.profile);
      return action.profile;
    case 'PROFILE_CLEAR':
      return {};
    default:
      return state;
  }
};
