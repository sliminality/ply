// @flow @format
import actions from './actionTypes';
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';
import type {
  NodeStyleMap,
  NormalizedNodeMap,
  NodeStyleMask,
  NodeStyleMaskDiff,
  NodeStyleDependencies,
} from '../types';

// Socket.io Events
export type ConnectAction = { type: typeof actions.CONNECT };
export type DisconnectAction = { type: typeof actions.DISCONNECT };
export type ReconnectAction = { type: typeof actions.RECONNECT };
export type ReconnectAttemptAction = { type: typeof actions.RECONNECT_ATTEMPT };
export type ReconnectFailedAction = { type: typeof actions.RECONNECT_FAILED };

// Server-to-client
export type TargetConnectedAction = { type: typeof actions.TARGET_CONNECTED };
export type TargetDisconnectedAction = {
  type: typeof actions.TARGET_DISCONNECTED,
};
export type ErrorAction = {
  type: typeof actions.ERROR,
  data: { error: string },
};

export type SetDocumentAction = {
  type: typeof actions.SET_DOCUMENT,
  data: {
    entities: {
      nodes: NormalizedNodeMap,
    },
  },
};

export type ToggleSelectNodeAction = {
  type: typeof actions.TOGGLE_SELECT_NODE,
  data: {
    nodeId: CRDP$NodeId,
  },
};

export type SetStylesAction = {
  type: typeof actions.SET_STYLES,
  data: {
    styles: NodeStyleMap,
  },
};

export type PruneNodeResultAction = {
  type: typeof actions.PRUNE_NODE_RESULT,
  data: {
    nodeId: CRDP$NodeId,
    error?: string,
    mask?: NodeStyleMask,
    diff?: NodeStyleMaskDiff,
  },
};

export type SetDependenciesAction = {
  type: typeof actions.SET_STYLES,
  data: {
    error?: string,
    dependants?: NodeStyleDependencies,
  },
};

// Can originate from server or client
export type SetInspectionRootAction = {
  type: typeof actions.SET_INSPECTION_ROOT,
  data: {
    nodeId: CRDP$NodeId,
  },
};

// Dispatched to state, but also pushed to server.
export type PruneNodeAction = {
  type: typeof actions.PRUNE_NODE,
  data: {
    nodeId: CRDP$NodeId,
  },
};

export type ComputeDependenciesAction = {
  type: 'COMPUTE_DEPENDENCIES',
  data: {
    nodeId: CRDP$NodeId,
    ruleIndex: number,
    propertyIndex: number,
  },
};

// Handled completely by server, never dispatched
export type HighlightNodeAction = {
  type: typeof actions.HIGHLIGHT_NODE,
  data: {
    nodeId: CRDP$NodeId,
    selectorList?: string,
  },
};

export type ClearHighlightAction = {
  type: typeof actions.CLEAR_HIGHLIGHT,
};

export type RequestStyleForNodeAction = {
  type: typeof actions.REQUEST_STYLE_FOR_NODE,
  data: {
    nodeId: CRDP$NodeId,
  },
};

export type ToggleCSSPropertyAction = {
  type: typeof actions.TOGGLE_CSS_PROPERTY,
  data: {
    nodeId: CRDP$NodeId,
    ruleIndex: number,
    propertyIndex: number,
  },
};

export type Action =
  | ConnectAction
  | DisconnectAction
  | ErrorAction
  | ReconnectAction
  | ReconnectAttemptAction
  | ReconnectFailedAction
  | TargetConnectedAction
  | TargetDisconnectedAction
  | SetDocumentAction
  | SetStylesAction
  | PruneNodeResultAction
  | SetDependenciesAction
  | SetInspectionRootAction
  | ToggleSelectNodeAction
  | PruneNodeAction
  | ComputeDependenciesAction
  | HighlightNodeAction
  | ClearHighlightAction
  | RequestStyleForNodeAction
  | ToggleCSSPropertyAction;
