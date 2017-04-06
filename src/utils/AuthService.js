import Auth0Lock from 'auth0-lock';
import { browserHistory } from 'react-router';

import store from '../store';
import { isTokenExpired } from './jwtHelper';
import * as ProfileActions from '../actions/ProfileActions';
import * as ApiActions from '../actions/ApiActions';

export default class AuthService {
  constructor(clientId, domain) {
    // Configure Auth0
    this.lock = new Auth0Lock(clientId, domain, {
      auth: {
        redirectUrl: 'https://localhost:8443/login',
        responseType: 'token',
        params: { scope: 'openid app_metadata' },
      },
      additionalSignUpFields: [
        {
          name: 'name_first',
          placeholder: 'enter first name',
        },
        {
          name: 'name_last',
          placeholder: 'enter last name',
        },
        {
          type: 'select',
          name: 'user_type',
          placeholder: 'select user type',
          options: [
            { value: 'parent', label: 'parent' },
            { value: 'student', label: 'student' },
            { value: 'administrator', label: 'administrator' },
            { value: 'educator', label: 'educator' },
          ],
        },
      ],
    });
    // Add callback for lock `authenticated` event
    this.lock.on('authenticated', this._doAuthentication.bind(this));
    // binds login functions to keep this context
    this.login = this.login.bind(this);
  }

  _doAuthentication(authResult) {
    // Saves the user token
    this.setToken(authResult.idToken);
    // navigate to the home route
    browserHistory.replace('/profile');

    this.lock.getProfile(authResult.idToken, (error, profile) => {
      if (error) {
        console.log('Error loading the Profile', error);
      } else {
        store.dispatch(ProfileActions.profileLoad(profile));

        if (!profile.init) {
          store.dispatch(ApiActions.initFromLock(authResult.idToken));
        }
      }
    });
  }

  login() {
    // Call the show method to display the widget.
    this.lock.show();
  }

  loggedIn() {
    // Checks if there is a saved token and it's still valid
    const token = this.getToken();
    return !!token && !isTokenExpired(token);
  }

  setToken(idToken) {
    // Saves user token to local storage
    localStorage.setItem('id_token', idToken);
  }

  getToken() {
    // Retrieves the user token from local storage
    return localStorage.getItem('id_token');
  }

  logout() {
    // Clear user token and profile data from local storage
    store.dispatch(ProfileActions.profileClear());
    localStorage.removeItem('id_token');
  }
}
