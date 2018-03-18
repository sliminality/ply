// @flow
import type {
  State,
  Connection,
  NormalizedNode,
  NormalizedNodeMap,
  NodeStyleMap,
  NodeStyle,
  NodeStyleMaskMap,
  NodeStyleDependencies,
  CSSPropertyIndices,
} from '../types';
import type { CRDP$NodeId } from 'devtools-typed/domain/DOM';
import type { CRDP$CSSProperty } from 'devtools-typed/domain/CSS';

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
export const getDependencies = (state: State): NodeStyleDependencies => state.dependencies || null;

export const getNodeById = (nodes: NormalizedNodeMap) => (
  nodeId: CRDP$NodeId
): ?NormalizedNode => nodes[nodeId] || null;

export const getStyleForNode = (
  styles: NodeStyleMap,
  nodeId: CRDP$NodeId
): ?NodeStyle => styles[nodeId] || null;

export const getCSSProperty = (state: State) => (nodeId: CRDP$NodeId, ruleIndex: number, propertyIndex: number): ?CRDP$CSSProperty => {
  const nodeStyles = state.styles[nodeId];
  if (!nodeStyles) {
    return null;
  }
  const ruleMatch = nodeStyles.matchedCSSRules[ruleIndex];
  if (!ruleMatch) {
    return null;
  }
  const property = ruleMatch.rule.style.cssProperties[propertyIndex];
  return property;
}

export const getDependantsForProperty = (dependencies: NodeStyleDependencies, indices: CSSPropertyIndices): ?Array<CSSPropertyIndices> => dependencies[indices];

export const filterSelectedNodes = (selectedNodes: {
  [CRDP$NodeId]: boolean,
}): Array<CRDP$NodeId> =>
  Object.keys(selectedNodes).filter(nodeId => !!selectedNodes[nodeId]);

