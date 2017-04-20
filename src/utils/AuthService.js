import Auth0Lock from 'auth0-lock';
import { browserHistory } from 'react-router';

import store from '../store';
import { isTokenExpired, decodeJWT } from './jwtHelper';
import * as ProfileActions from '../actions/ProfileActions';
import * as ApiActions from '../actions/ApiActions';

export default class AuthService {
  constructor(clientId, domain) {
    // Configure Auth0
    this.lock = new Auth0Lock(clientId, domain, {
      oidcConformant: true,
      autoclose: true,
      auth: {
        redirectUrl: 'https://localhost:8443/login',
        responseType: 'token id_token',
        params: {
          scope: 'openid',
          audience: 'https://localhost:8443/api',
        },
      },
      additionalSignUpFields: [
        {
          name: 'name',
          placeholder: 'enter full name',
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
            { value: 'other', label: 'other' },
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
    const decodedIdToken = decodeJWT(authResult.idToken);

    // Saves the user token
    console.log('authResult: ', authResult);
    this.setToken(authResult.idToken);
    this.setAccessToken(authResult.accessToken);
    // navigate to the profile page after login
    browserHistory.replace('/profile');

    store.dispatch(ProfileActions.profileLoad(decodedIdToken));

    if (!decodedIdToken['https://localhost:8443/app_metadata'].init) {
      store.dispatch(ApiActions.initFromLock(authResult.accessToken));
    }
  }

  login() {
    // Call the show method to display the widget.
    this.lock.show();
  }

  loggedIn() {
    // Checks if there is a saved id token and it's still valid
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

  setAccessToken(accessToken) {
    // Saves user token to local storage
    localStorage.setItem('access_token', accessToken);
  }

  getAccessToken() {
    // Retrieves the user token from local storage
    return localStorage.getItem('access_token');
  }

  logout() {
    // Clear user token and profile data from local storage
    store.dispatch(ProfileActions.profileClear());
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
  }
}
