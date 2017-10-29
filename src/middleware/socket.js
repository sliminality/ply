// @flow @format
import io from 'socket.io-client';
import actionTypes from '../actions/actionTypes';
import config from './config';
import messageTypes from './messageTypes';
import { getStyleForNode } from '../selectors';
import { requestStyleForNode } from '../actions';

import type { Store, Dispatch } from 'redux';
import type { OutgoingMessageType } from './types';
import type { Action } from '../actions/types';

const _url = config.socketURL(config.socketPort);
const _socket = io.connect(_url, config.socketOptions);

function init(store: Store) {
  // Add listeners to socket messages, so they can be re-dispatched
  // as actionTypes.
  // https://github.com/maxnachlinger/redux-websocket-example/
  const { socketio, incoming } = messageTypes;
  const messagesToBind = [...Object.keys(socketio), ...Object.keys(incoming)];
  for (const messageType of messagesToBind) {
    _socket.on(messageType, data =>
      // Action creator for all socket incoming messages.
      store.dispatch({
        type: messageType.toUpperCase(),
        data,
      }),
    );
  }
}

function emit(message: OutgoingMessageType, data?: Object) {
  _socket.emit(message, data);
}

const socketMiddleware = (store: Store) => (next: Dispatch) => (
  action: Action,
) => {
  const { outgoing } = messageTypes;
  switch (action.type) {
    // Certain actionTypes are only intended to be sent to the server,
    // never reduced.
    case actionTypes.CLEAR_HIGHLIGHT:
      emit(outgoing.CLEAR_HIGHLIGHT);
      break;
    case actionTypes.HIGHLIGHT_NODE:
      emit(outgoing.HIGHLIGHT_NODE, action.data);
      break;
    case actionTypes.REQUEST_STYLE_FOR_NODE:
      emit(outgoing.REQUEST_STYLE_FOR_NODE, action.data);
      break;
    case actionTypes.TOGGLE_CSS_PROPERTY:
      emit(outgoing.TOGGLE_CSS_PROPERTY, action.data);
      break;

    // Some actionTypes trigger local state updates (usually for UI changes),
    // but also get sent to the server.
    case actionTypes.PRUNE_NODE:
      emit(outgoing.PRUNE_NODE, action.data);
      return next(action);
    case actionTypes.TOGGLE_SELECT_NODE:
      // Request styles if they don't exist.
      const { nodeId } = action.data;
      const style = getStyleForNode(store.getState(), nodeId);
      if (!style) {
        next(requestStyleForNode(nodeId));
      }
      return next(action);

    default:
      return next(action);
  }
};

export { init };
export default socketMiddleware;
