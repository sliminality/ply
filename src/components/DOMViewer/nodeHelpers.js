// @flow
import React from 'react';

/**
 * Types of nodes.
 * - Fork: a node with regular children. May be expanded/collapsed.
 * - Inline Leaf: a node with one child, a Value. Rendered with content inline.
 * - Value: a node with no children and a value, e.g. text.
 */

export const nodeType = (node: Node): NodeType => {
  const { children, attributes } = node;

  if (children && children.length > 0) {
    if (children.length > 1) {
      return 'FORK';
    } else {
      // One child; check if it has attributes.
      return children[0].attributes ? 'FORK' : 'INLINE_LEAF';
    }
  } else {
    // No children; check if there are attributes.
    return attributes ? 'INLINE_LEAF' : 'LEAF';
  }
};

export const splitPairs = arr =>
  arr.reduce((memo, curr, i) => {
    if (i % 2 === 0) {
      return [...memo, [curr]];
    } else {
      const lastIndex = memo.length - 1;
      return [...memo.slice(0, lastIndex), [...memo[lastIndex], curr]];
    }
  }, []);

export const pairToAttr = ([name, value], i) =>
  (new Set(['class', 'id']).has(name)
    ? <li key={i}>
        <span className={`Node__attr-value--${name}`}>
          {value}
        </span>
      </li>
    : <li key={i}>
        <span className="Node__attr-name">
          {name}
        </span><span className="Node__attr-value">
          {value}
        </span>
      </li>);

export const truncate = len => str => `${str.substring(0, len)}...`;
