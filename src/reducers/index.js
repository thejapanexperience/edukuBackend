import { combineReducers } from 'redux';

import contacts from './contacts';
import profile from './profile';
import validateJwt from './validateJwt';

export default combineReducers({ contacts, profile, validateJwt });
