import { combineReducers } from 'redux';

import profile from './profile';
import validateJwt from './validateJwt';
import initFromLock from './initFromLock';
import createChildUser from './createChildUser';
import getChildUser from './getChildUser';

// TODO: CLEAR STORE ON LOGOUT

export default combineReducers({ profile, validateJwt, initFromLock, createChildUser, getChildUser });
