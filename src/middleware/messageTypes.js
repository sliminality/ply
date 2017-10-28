// @flow

// TODO: test that every action defined in actions/actionTypes.js has
// a corresponding messageType here.

const messageTypes = {
  incoming: {
    // socket.io API
    connect: 'connect',
    disconnect: 'disconnect',
    reconnect: 'reconnect',
    reconnect_attempt: 'reconnect_attempt',
    reconnect_failed: 'reconnect_failed',

    // Server -> Client
    target_connected: 'target_connected',
    target_disconnected: 'target_disconnected',
    prune_node_result: 'prune_node_result',
    set_document: 'set_document',
    set_styles: 'set_styles',
    set_inspection_root: 'set_inspection_root',
  },
  outgoing: {
    // Dispatched to store AND pushed to server
    prune_node: 'prune_node',

    // Pushed to server only
    clear_highlight: 'clear_highlight',
    highlight_node: 'highlight_node',
    request_style_for_node: 'request_style_for_node',
    toggle_css_property: 'toggle_css_property',
  },
};

export default messageTypes;
