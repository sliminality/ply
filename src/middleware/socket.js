// @flow @format
import io from 'socket.io-client';
import actionTypes from '../actions/actionTypes';
import config from './config';
import messageTypes from './messageTypes';
import {
  getIsPruning,
  getStyles,
  getStyleForNode,
  getSelectedNodes,
} from '../selectors';

import type { Store, Dispatch } from 'redux';
import type { OutgoingMessage } from './types';
import type { Action } from '../actions/types';

const { incoming, outgoing, socketio } = messageTypes;

const _url = config.socketURL(config.socketPort);
const _socket = io.connect(_url, config.socketOptions);

let hasStyles = false;

function init(store: Store) {
  // Add listeners to socket messages, so they can be re-dispatched
  // as actionTypes.
  // https://github.com/maxnachlinger/redux-websocket-example/
  const messagesToBind = [...Object.keys(socketio), ...Object.keys(incoming)];

  // Action creator for all socket incoming messages.
  const onIncomingMessage = messageType => data => {
    if (messageType === incoming.SET_STYLES) {
      if (hasStyles) {
        console.timeEnd('REQUEST TOGGLE');
        console.time('FROM RECEIVED TO COMPONENT');
      } else {
        hasStyles = true;
      }
    }
    store.dispatch({
      type: messageType.toUpperCase(),
      data,
    });
  };

  for (const messageType of messagesToBind) {
    _socket.on(messageType, onIncomingMessage(messageType));
  }
}

function emit(message: OutgoingMessage, data?: Object) {
  _socket.emit(message, data);
}

const socketMiddleware = (store: Store) => (next: Dispatch) => (
  action: Action,
) => {
  const state = store.getState();
  const isPruning = getIsPruning(state);
  switch (action.type) {
    // Certain actionTypes are only intended to be sent to the server,
    // never reduced.
    case actionTypes.CLEAR_HIGHLIGHT:
      emit(outgoing.CLEAR_HIGHLIGHT);
      break;
    case actionTypes.HIGHLIGHT_NODE:
      // If pruning is happening, we can't highlight nodes.
      if (!isPruning) {
        emit(outgoing.HIGHLIGHT_NODE, action.data);
      }
      break;
    case actionTypes.REQUEST_STYLE_FOR_NODE:
      console.group();
      console.time(incoming.SET_STYLES);
      emit(outgoing.REQUEST_STYLE_FOR_NODE, action.data);
      break;
    case actionTypes.TOGGLE_CSS_PROPERTY:
      // If pruning is happening, we can't toggle properties.
      if (!isPruning) {
        console.group();
        console.time('REQUEST TOGGLE');
        emit(outgoing.TOGGLE_CSS_PROPERTY, action.data);
      }
      break;

    // Some actionTypes trigger local state updates (usually for UI changes),
    // but also get sent to the server.
    case actionTypes.PRUNE_NODE:
      emit(outgoing.PRUNE_NODE, action.data);
      return next(action);
    case actionTypes.COMPUTE_DEPENDENCIES:
      emit(outgoing.COMPUTE_DEPENDENCIES, action.data);
      return next(action);

    case actionTypes.SET_INSPECTION_ROOT:
    case actionTypes.TOGGLE_SELECT_NODE:
      const { nodeId } = action.data;
      const selectedNodes = getSelectedNodes(state);

      // If the node is not currently selected, that means we are
      // about to display it.
      if (!selectedNodes[nodeId]) {
        // Request styles if they don't exist.
        // HACK: Don't cache styles at all. Always request new ones.
        // const styles = getStyles(state);
        // const style = getStyleForNode(styles, nodeId);
        // if (!style) {
        emit(outgoing.REQUEST_STYLE_FOR_NODE, action.data);
        // }
      }
      return next(action);

    default:
      return next(action);
  }
};

export { init };
export default socketMiddleware;
