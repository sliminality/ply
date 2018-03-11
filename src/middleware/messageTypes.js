// @flow ; @format
const actionTypes = require('../actions/actionTypes');

const {
  TARGET_CONNECTED,
  TARGET_DISCONNECTED,
  ERROR,
  PRUNE_NODE_RESULT,
  SET_DOCUMENT,
  SET_STYLES,
  SET_INSPECTION_ROOT,
  SET_DEPENDENCIES,

  PRUNE_NODE,
  CLEAR_HIGHLIGHT,
  HIGHLIGHT_NODE,
  REQUEST_STYLE_FOR_NODE,
  TOGGLE_CSS_PROPERTY,
  COMPUTE_DEPENDENCIES,
} = actionTypes;

// TODO: test that every action defined in actions/actionTypes.js has
// a corresponding messageType here.

const messageTypes = {
  socketio: {
    connect: 'connect',
    disconnect: 'disconnect',
    reconnect: 'reconnect',
    reconnect_attempt: 'reconnect_attempt',
    reconnect_failed: 'reconnect_failed',
  },
  incoming: {
    // Server -> Client
    TARGET_CONNECTED,
    TARGET_DISCONNECTED,
    ERROR,
    PRUNE_NODE_RESULT,
    SET_DOCUMENT,
    SET_STYLES,
    SET_DEPENDENCIES,
    SET_INSPECTION_ROOT,
  },
  outgoing: {
    // Dispatched to store AND pushed to server
    PRUNE_NODE,
    COMPUTE_DEPENDENCIES,

    // Pushed to server only
    CLEAR_HIGHLIGHT,
    HIGHLIGHT_NODE,
    REQUEST_STYLE_FOR_NODE,
    TOGGLE_CSS_PROPERTY,
  },
};

module.exports = messageTypes;
