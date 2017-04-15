// @flow
/* eslint-disable no-unused-expressions, no-undef */

/**
 * Since NodeIds are frequently used as keys of an object
 * (i.e. strings), we type them as a disjoint union.
 */
declare type NodeId = number | string;

declare type NodeType = 'FORK' | 'INLINE_LEAF' | 'LEAF';

declare type NodeWithParent = Node & { parentId: NodeId };

declare type ComputedStyle = { [prop: string]: string };

declare type NodeStyles =
  & {
    nodeId: NodeId,
    parentComputedStyle: ComputedStyle,
    computedStyle: ComputedStyle,
  }
  & MatchedStyles;
