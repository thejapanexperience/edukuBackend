import { createStore } from 'redux';
import reducers from './reducers';

import { saveState, loadState } from './localStorage';

const store = createStore(reducers, loadState());
store.subscribe(() => saveState(store.getState()));

export default store;
