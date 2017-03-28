import React from 'react';
import { Route, IndexRoute } from 'react-router';

import Layout from './components/Layout';
import Profile from './components/Profile';
import Login from './components/Login';
import Home from './components/Home';
import AuthService from './utils/AuthService';
import Auth from './containers/Auth';

const auth = new AuthService('7owQ3lWstSd04Mh82aN7iCTfgPGpQOsR', 'ziyaemanet.auth0.com');

const requireAuth = (nextState, replace) => {
  if (!auth.loggedIn()) {
    replace({ pathname: '/login' });
  }
};

const Routes = () => (
  <Route path="/" component={Layout}>
    <Route component={Auth} auth={auth}>
      <IndexRoute component={Home} />
      <Route path="/profile" component={Profile} onEnter={requireAuth} />
      <Route path="/login" component={Login} />
    </Route>
  </Route>
);

export default Routes;
