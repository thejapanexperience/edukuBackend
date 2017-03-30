import { combineReducers } from 'redux';

import contacts from './contacts';
import profile from './profile';

export default combineReducers({ contacts, profile });
