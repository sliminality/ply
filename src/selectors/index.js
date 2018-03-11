// @flow
import type {
  State,
  Connection,
  NormalizedNode,
  NormalizedNodeMap,
  NodeStyleMap,
  NodeStyle,
  NodeStyleMaskMap,
} from '../types';
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';

export const getConnection = (state: State): Connection => state.connection;
export const getError = (state: State): ?string => state.error;
export const getInspectionRoot = (state: State): ?CRDP$NodeId =>
  state.inspectionRoot;
export const getStyles = (state: State): NodeStyleMap => state.styles;
export const getIsPruning = (state: State): bool => state.isPruning;
export const getSelectedNodes = (state: State): { [CRDP$NodeId]: boolean } =>
  state.selectedNodes;
export const getNodes = (state: State): NormalizedNodeMap =>
  state.entities && state.entities.nodes ? state.entities.nodes : {};
export const getPruned = (state: State): NodeStyleMaskMap => state.pruned || null;

export const getNodeById = (nodes: NormalizedNodeMap) => (
  nodeId: CRDP$NodeId
): ?NormalizedNode => nodes[nodeId] || null;

export const getStyleForNode = (
  styles: NodeStyleMap,
  nodeId: CRDP$NodeId
): ?NodeStyle => styles[nodeId] || null;

export const filterSelectedNodes = (selectedNodes: {
  [CRDP$NodeId]: boolean,
}): Array<CRDP$NodeId> =>
  Object.keys(selectedNodes).filter(nodeId => !!selectedNodes[nodeId]);

