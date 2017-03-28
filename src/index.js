import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';

import store from './store';
import Routes from './Routes';

render(
  <Provider store={store}>
    <Router history={browserHistory}>
      {Routes()}
    </Router>
  </Provider>,
  document.getElementById('root'),
);
