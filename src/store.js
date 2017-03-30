import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';

import reducers from './reducers';
import { saveState, loadState } from './localStorage';

const middleware = [
  thunkMiddleware,
  promiseMiddleware(),
];

const store = createStore(
  reducers,
  loadState(),
  composeWithDevTools(applyMiddleware(...middleware)),
);

store.subscribe(() => saveState(store.getState()));

export default store;
