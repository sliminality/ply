// @flow
/* eslint-disable no-unused-expressions, no-undef */

declare type NodeId = number;
declare type NodeMap = { [NodeId]: Node };
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
