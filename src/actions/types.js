// @flow @format
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';
import type { NodeStyleMap, NormalizedNodeMap } from '../types';

// Socket.io Events
export type ConnectAction = { type: 'CONNECT' };
export type DisconnectAction = { type: 'DISCONNECT' };
export type ReconnectAction = { type: 'RECONNECT' };
export type ReconnectAttemptAction = { type: 'RECONNECT_ATTEMPT_ACTION' };
export type ReconnectFailedAction = { type: 'RECONNECT_FAILED_ACTION' };

// Server-to-client
export type TargetConnectedAction = { type: 'TARGET_CONNECTED' };
export type TargetDisconnectedAction = { type: 'TARGET_DISCONNECTED' };
export type ErrorAction = { type: 'ERROR', data: { error: string } };

export type SetDocumentAction = {
  type: 'SET_DOCUMENT',
  data: {
    entities: {
      nodes: NormalizedNodeMap,
    },
  },
};

export type ToggleSelectNodeAction = {
  type: 'TOGGLE_SELECT_NODE',
  data: {
    nodeId: CRDP$NodeId,
  },
};

export type SetStylesAction = {
  type: 'SET_STYLES',
  data: {
    styles: NodeStyleMap,
  },
};

export type PruneNodeResultAction = {
  type: 'PRUNE_NODE_RESULT',
  data: {
    error?: string,
  },
};

// Can originate from server or client
export type SetInspectionRootAction = {
  type: 'SET_INSPECTION_ROOT',
  data: {
    nodeId: CRDP$NodeId,
  },
};

// Dispatched to state, but also pushed to server.
export type PruneNodeAction = {
  type: 'PRUNE_NODE',
  data: {
    nodeId: CRDP$NodeId,
  },
};

// Handled completely by server, never dispatched
export type HighlightNodeAction = {
  type: 'HIGHLIGHT_NODE',
  data: {
    nodeId: CRDP$NodeId,
    selectorList?: string,
  },
};

export type ClearHighlightAction = {
  type: 'CLEAR_HIGHLIGHT',
};

export type RequestStyleForNodeAction = {
  type: 'REQUEST_STYLE_FOR_NODE',
  data: {
    nodeId: CRDP$NodeId,
  },
};

export type ToggleCSSPropertyAction = {
  type: 'TOGGLE_CSS_PROPERTY',
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
  | SetInspectionRootAction
  | ToggleSelectNodeAction
  | PruneNodeAction
  | HighlightNodeAction
  | ClearHighlightAction
  | RequestStyleForNodeAction
  | ToggleCSSPropertyAction;
