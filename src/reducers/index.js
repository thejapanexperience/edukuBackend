import { combineReducers } from 'redux';

import profile from './profile';
import validateJwt from './validateJwt';
import initFromLock from './initFromLock';

export default combineReducers({ profile, validateJwt, initFromLock });
