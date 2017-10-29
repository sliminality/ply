// @format
import React from 'react';
import ReactDOM from 'react-dom';
import Inspector from './containers/Inspector';
import './index.css';

// Redux stuff
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './reducers';
import socketMiddleware, { init as socketInit } from './middleware/socket';

import type { State } from './types';

const initialState: State = {
  connection: {
    connected: false,
    targetConnected: false,
    reconnecting: false,
  },
  selectedNodes: {},
  inspectionRoot: null,
  styles: {},
  isPruning: false,
  entities: { nodes: {} },
};

function setupStore() {
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(socketMiddleware)),
  );
  socketInit(store);
  return store;
}

ReactDOM.render(
  <Provider store={setupStore()}>
    <Inspector />
  </Provider>,
  document.getElementById('root'),
);
