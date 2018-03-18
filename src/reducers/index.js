// @flow @format
import { combineReducers } from 'redux';
import actionTypes from '../actions/actionTypes';

import type { Action } from '../actions/types';
import type {
  Connection,
  NormalizedNodeMap,
  NodeStyleMap,
  NodeStyleMaskMap,
  NodeStyleDependencies,
} from '../types';
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';

function connection(
  state: Connection = {
    connected: false,
    targetConnected: false,
    reconnecting: false,
  },
  action: Action,
): Connection {
  switch (action.type) {
    case actionTypes.CONNECT:
    case actionTypes.RECONNECT:
      return {
        ...state,
        connected: true,
        reconnecting: false,
      };
    case actionTypes.DISCONNECT:
      return {
        ...state,
        connected: false,
        targetConnected: false,
      };
    case actionTypes.RECONNECT_ATTEMPT:
      return {
        ...state,
        reconnecting: true,
      };
    case actionTypes.TARGET_CONNECTED:
      return {
        ...state,
        targetConnected: true,
      };
    case actionTypes.TARGET_DISCONNECTED:
      return {
        ...state,
        targetConnected: false,
      };
    default:
      return state;
  }
}

function inspectionRoot(
  state: ?CRDP$NodeId = null,
  action: Action,
): ?CRDP$NodeId {
  switch (action.type) {
    case actionTypes.SET_DOCUMENT:
      return null;

    case actionTypes.SET_INSPECTION_ROOT:
      return action.data.nodeId;

    default:
      return state;
  }
}

function styles(state: NodeStyleMap = {}, action: Action): NodeStyleMap {
  switch (action.type) {
    case actionTypes.SET_DOCUMENT:
      // Completely replace styles when document is changed.
      return {};

    case actionTypes.SET_STYLES:
      // TODO: should we ever delete old state?
      // like if nodes no longer exist
      return {
        ...state,
        ...action.data.styles,
      };

    default:
      return state;
  }
}

function pruned(
  state: NodeStyleMaskMap = {},
  action: Action,
): NodeStyleMaskMap {
  switch (action.type) {
    case actionTypes.PRUNE_NODE_RESULT:
      // If the result contains a mask, we need to overwrite
      // the currently-stored mask.
      if (action.data.mask && action.data.nodeId) {
        return {
          ...state,
          [action.data.nodeId]: action.data.mask,
        };
      }
      return state;

    default:
      return state;
  }
}

function isPruning(state: boolean = false, action: Action): boolean {
  switch (action.type) {
    case actionTypes.PRUNE_NODE:
      return true;

    case actionTypes.PRUNE_NODE_RESULT:
      return false;

    case actionTypes.COMPUTE_DEPENDENCIES:
      return true;

    case actionTypes.SET_DEPENDENCIES:
      return false;

    default:
      return state;
  }
}

function dependencies(
  state: NodeStyleDependencies = {},
  action: Action,
): NodeStyleDependencies {
  switch (action.type) {
    case actionTypes.SET_DEPENDENCIES:
      if (action.data.dependencies) {
        return { ...state, ...action.data.dependencies };
      }
      return state;

    default:
      return state;
  }
}

function resolveDiff(styles, { nodeId, maskDiff }) {
  const result = {};
  const nodeRules = styles[nodeId].matchedCSSRules;
  if (maskDiff.enabled) {
    result.enabled = maskDiff.enabled.map(
      ([ruleIndex, propertyIndex]) =>
        nodeRules[ruleIndex].rule.style.cssProperties[propertyIndex],
    );
  }
  if (maskDiff.disabled) {
    result.disabled = maskDiff.disabled.map(
      ([ruleIndex, propertyIndex]) =>
        nodeRules[ruleIndex].rule.style.cssProperties[propertyIndex],
    );
  }
  return result;
}

// TODO: when we are normalizing more than just nodes,
// switch to using reducer composition and turn this into a
// `nodes` reducer inside the `entities` object.
function entities(
  state: { nodes: NormalizedNodeMap } = { nodes: {} },
  action: Action,
): { nodes: NormalizedNodeMap } {
  switch (action.type) {
    case actionTypes.SET_DOCUMENT:
      return action.data.entities;
    default:
      return state;
  }
}

function selectedNodes(
  state: { [CRDP$NodeId]: boolean } = {},
  action: Action,
): { [CRDP$NodeId]: boolean } {
  switch (action.type) {
    case actionTypes.SET_DOCUMENT:
      // Clear all selections when a new document is pushed.
      return {};

    case actionTypes.SET_INSPECTION_ROOT:
      return { [action.data.nodeId]: true };

    case actionTypes.TOGGLE_SELECT_NODE:
      const { nodeId } = action.data;
      // HACK: Disabling multiple inspection.
      // return { ...state, [nodeId]: !state[nodeId] };
      return { [nodeId]: !state[nodeId] };

    default:
      return state;
  }
}

function error(state: ?string = null, action: Action): ?string {
  switch (action.type) {
    case actionTypes.ERROR:
      return action.data.error;

    case actionTypes.PRUNE_NODE_RESULT:
      return action.data.error || null;

    default:
      return state;
  }
}

export default combineReducers({
  connection,
  error,
  inspectionRoot,
  pruned,
  dependencies,
  selectedNodes,
  styles,
  isPruning,
  entities,
});
