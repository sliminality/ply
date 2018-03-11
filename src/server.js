//
const config = require('./middleware/config');
const io = require('socket.io')().attach(config.socketPort);
const messageTypes = require('./middleware/messageTypes');

/*::
import type {NodeStyleMap, NormalizedNodeMap, NodeStyleMaskMap} from './types';
import type {CRDP$NodeId} from 'devtools-typed/domain/DOM';
import type {Action} from './actions/types';
*/

const {
  socketio,
  incoming,
  outgoing,
} = messageTypes;

// Store state to provide either client.

/*::
type State = {
  inspectionRoot: ?CRDP$NodeId,
  styles: NodeStyleMap,
  nodes?: NormalizedNodeMap,
  pruned?: NodeStyleMaskMap,
};
*/
const INITIAL_STATE = {
  inspectionRoot: null,
  nodes: {},
  styles: {},
  pruned: {},
};

let state = INITIAL_STATE;
const connections = {
  browsers: new Set(),
  apps: new Set(),
};
const namespaces = {
  // /browser - for browser clients (Chrome extension)
  browsers: io.of('/browsers'),
  // /app - for clients requesting info from browsers
  apps: io.of('/apps'),
};

namespaces.browsers.on(socketio.connect, onBrowserConnect);
namespaces.apps.on(socketio.connect, onClientConnect);

/**
 * Browser clients (debugging pages).
 */
function onBrowserConnect(browser) {
  registerConnection(browser.id, 'browsers');
  emitToApps({ type: incoming.TARGET_CONNECTED });
  browser.on(socketio.disconnect, registerDisconnect(browser.id, 'browsers'));

  for (const message of Object.keys(incoming)) {
    browser.on(message, data => {
      maybeUpdateState(message, data);
      emitToApps({ type: message, data });
    });
  }
}

function onClientConnect(app) {
  registerConnection(app.id, 'apps');

  // Push info about connections and initial data.
  if (connections.browsers.size > 0) {
    emitToApps({ type: incoming.TARGET_CONNECTED });
  } else {
    emitToApps({ type: incoming.TARGET_DISCONNECTED });
  }
  emitToApps({
    type: incoming.SET_DOCUMENT,
    data: {
      entities: {
        nodes: state.nodes,
      },
    },
  });
  emitToApps({
    type: incoming.SET_STYLES,
    data: {
      styles: state.styles,
    },
  });
  emitToApps({
    type: incoming.SET_INSPECTION_ROOT,
    data: {
      nodeId: state.inspectionRoot,
    },
  });

  const prunedNodes = Object.keys(state.pruned);
  for (const nodeId of prunedNodes) {
    emitToApps({
      type: incoming.PRUNE_NODE_RESULT,
      data: {
        nodeId,
        mask: state.pruned[nodeId],
      },
    });
  }

  for (const type of Object.keys(outgoing)) {
    app.on(type, data => onClientRequest({ type, data }));
  }
  app.on(socketio.disconnect, registerDisconnect(app.id, 'apps'));
}

function emitToApps({ type, data } /*: Action */) {
  if (data) {
    const dataString = JSON.stringify(data, null, 2);
    if (config.server.logVerbose) {
      log(dataString);
    } else {
      log(type, `${dataString.substring(0, config.server.truncateLength)}...`);
    }
  }
  // TODO: Refactor this to support multiple clients.
  namespaces.apps.emit(type, data);
}

function maybeUpdateState(message /*: IncomingMessage */, data /*?: Object */) {
  switch (message) {
    case incoming.SET_DOCUMENT:
      // Update nodes and styles.
      state.nodes = data.entities.nodes;
      state.styles = data.styles;
      break;
    case incoming.SET_STYLES:
      // TODO: think about pruning stale styles
      state.styles = Object.assign({}, state.styles, data.styles);
      break;
    case incoming.SET_INSPECTION_ROOT:
      state.inspectionRoot = data.nodeId;
      break;
    case incoming.PRUNE_NODE_RESULT:
      if (data.nodeId && data.mask) {
        state.pruned = {
          ...state.pruned,
          [data.nodeId]: data.mask,
        }
      }
      break;
    default:
      break;
  }
}

function onClientRequest(message /*: Action */) {
  if (connections.browsers.size > 0) {
    const reqStr = JSON.stringify(message, null, 2);
    log(reqStr);
    namespaces.browsers.emit(message.type, message.data);
  } else {
    // If there are no connected browsers, respond with an error.
    namespaces.apps.emit(incoming.ERROR, { error: 'No available browser targets' });
  }
}

function registerConnection(socketId /*: number */, type /*: 'browsers' | 'apps' */) {
  if (connections[type].has(socketId)) {
    throw new Error(`tried to connect a ${type} already added`);
  }
  connections[type].add(socketId);
  logConnections({
    connected: true,
    socketId,
    what: type,
    apps: connections.apps.size,
    browsers: connections.browsers.size,
  });
}

function registerDisconnect(socketId /*: number */, type /*: 'browsers' | 'apps' */) {
  return function() {
    if (connections[type].has(socketId)) {
      connections[type].delete(socketId);
      logConnections({
        connected: false,
        socketId,
        what: type,
        apps: connections.apps.size,
        browsers: connections.browsers.size,
      });
      if (type === 'browsers') {
        state = INITIAL_STATE;
      }
    } else {
      throw new Error(`tried to disconnect a ${type} that didnt exist`);
    }
    if (type === 'browsers') {
      emitToApps({ type: incoming.TARGET_DISCONNECTED });
    }
  };
}

function logConnections({ connected, what, socketId, apps, browsers }) {
  const status = connected ? 'Connected to' : 'Disconnected from';
  const lines = [
    `${status} ${what}: ${socketId}`,
    `Total apps: ${apps}`,
    `Total browsers: ${browsers}`,
  ];
  // $FlowFixMe - doesn't see `process.stdout.columns`
  const cols = process.stdout.columns;
  const msg = lines
    .map(s => `| ${s}${' '.repeat(Math.max(0, cols - s.length - 4))} |`)
    .join('');
  log(msg);
};

function log(...msg) {
  // $FlowFixMe - doesn't see `process.stdout.columns`
  const cols = process.stdout.columns;
  const divider = '-'.repeat(cols);
  console.log(divider);
  console.log(...msg);
};

