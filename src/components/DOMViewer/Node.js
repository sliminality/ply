// @flow
import React from 'react';
import TreeView from 'react-treeview';

/**
 * Types of nodes.
 * - Fork: a node with regular children. May be expanded/collapsed.
 * - Inline Leaf: a node with one child, a Value. Rendered with content inline.
 * - Value: a node with no children and a value, e.g. text.
 */
const FORK = 'FORK';
const INLINE_LEAF = 'INLINE_LEAF';
const LEAF = 'LEAF';

type NodeType = FORK | INLINE_LEAF | LEAF;

const nodeType = (node: Node): NodeType => {
  const { children, attributes } = node;

  if (children && children.length > 0) {
    if (children.length > 1) {
      return FORK;
    } else {
      // One child; check if it has attributes.
      return children[0].attributes
        ? FORK
        : INLINE_LEAF;
    }
  } else {
    // No children; check if there are attributes.
    return attributes
      ? INLINE_LEAF
      : LEAF;
  }
}

const splitPairs = arr => arr.reduce((memo, curr, i) => {
  if (i % 2 === 0) {
    return [...memo, [ curr ]];
  } else {
    const lastIndex = memo.length - 1;
    return [
      ...memo.slice(0, lastIndex),
      [...memo[lastIndex], curr],
    ];
  }
}, []);

const pairToAttr = ([ name, value ], i) =>
  new Set(['class', 'id']).has(name)
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
      </li>;

const truncate = len => str => `${str.substring(0, len)}...`;

const NodeLabel = ({ node, selectNode }) => {
  const type = nodeType(node);
  const maxTextLength = 40;
  const truncateText = truncate(maxTextLength);

  if (type === LEAF) {
    // Just need to get the current node's value.
    const { nodeValue } = node;
    return (
      <div className="Node">
        <span className="Node__value">
          {truncateText(nodeValue)}
        </span>
      </div>
    );
  } else {
    // Create a full label, including the node's name and
    // attributes.
    const { attributes, localName } = node;
    const name =
      <span className="Node__name">
        {localName}
      </span>;
    const attrs =
      <ul className="Node__attr-list">
        {splitPairs(attributes).map(pairToAttr)}
      </ul>;
    let child = null;

    const sharedProps = {
      className: 'Node__label',
      onClick: selectNode,
    };

    // If it's an inline leaf with a single text child
    // (e.g. an <h1>) we need to get the child's value.
    const hasInlineChild = type === INLINE_LEAF
      && node.children[0];

    if (hasInlineChild) {
      const childValue = node.children[0].nodeValue;
      child =
        <span className="Node__child-value">
          {truncateText(childValue)}
        </span>;
    }

    return (
      <div {...sharedProps}>
        {name}
        {attrs}
        {child}
      </div>
    );
  }
};

const nodeActions = ({ toggleSelected, isSelected }) => {
  // Naming our inner function so that recursion, like, works
  const Node = (node: Node) => {
    const { nodeId } = node;
    const selectNode = () => toggleSelected(nodeId);
    const label = NodeLabel({ node, selectNode });

    // Compute className string.
    const type = nodeType(node);
    const nodeClass = {
      [FORK]: 'Node',
      [INLINE_LEAF]: 'Node Node--leaf',
      [LEAF]: 'Node Node--leaf',
    }[type];

    const selected = isSelected(nodeId) ? 'Node--selected' : null;
    const className = [nodeClass, selected].join(' ');

    // Props shared between leaf and fork nodes.
    const sharedProps = {
      key: nodeId,  // for React
    };

    const isLeafNode = type === INLINE_LEAF
      || type === LEAF;
    if (isLeafNode) {
      const props = {...sharedProps, className};
      return (
        <div {...props}>
          {label}
        </div>
      );
    }

    // Get children if it's a fork.
    const { children } = node;
    const childNodes = children.map(Node);
    const props = {
      ...sharedProps,
      nodeLabel: label,
      itemClassName: className,
      defaultCollapsed: true,
    };

    return (
      <TreeView {...props}>
        {childNodes}
      </TreeView>
    );
  };

  return Node;
};

export default nodeActions;
