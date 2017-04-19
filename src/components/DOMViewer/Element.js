// @flow
import React from 'react';
import TreeView from 'react-treeview';
import {
  nodeType,
  splitPairs,
  pairToAttr,
  truncate,
  attrWhiteList,
} from './nodeHelpers';

const ElementLabel = ({ node, selectNode }) => {
  const type = nodeType(node);
  const maxTextLength = 40;
  const truncateText = truncate(maxTextLength);

  if (type === 'LEAF') {
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
    const name = (
      <span className="Node__name">
        {localName}
      </span>
    );
    const attrList = attributes &&
      splitPairs(attributes).filter(attrWhiteList).map(pairToAttr);

    const attrs = (
      <ul className="Node__attr-list">
        {attrList}
      </ul>
    );
    let child = null;

    const sharedProps = {
      className: 'Node__label',
      onClick: selectNode,
    };

    // If it's an inline leaf with a single text child
    // (e.g. an <h1>) we need to get the child's value.
    const hasInlineChild = type === 'INLINE_LEAF' && node.children[0];

    if (hasInlineChild) {
      const childValue = node.children[0].nodeValue;
      child = (
        <span className="Node__child-value">
          {truncateText(childValue)}
        </span>
      );
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

type ElementProps = {
  toggleSelected: (nodeId: NodeId) => void,
  isSelected: (nodeId: NodeId) => boolean,
};

const Element = ({ toggleSelected, isSelected }: ElementProps) => {
  // Naming our inner function so that recursion, like, works
  const elWithActions = (node: Node) => {
    const { nodeId } = node;
    const selectNode = () => toggleSelected(nodeId);
    const label = ElementLabel({ node, selectNode });

    // Compute className string.
    const type = nodeType(node);
    const nodeClass = {
      FORK: 'Node',
      INLINE_LEAF: 'Node Node--leaf',
      LEAF: 'Node Node--leaf',
    }[type];

    const selected = isSelected(nodeId) ? 'Node--selected' : null;
    const className = [nodeClass, selected].join(' ');

    // Props shared between leaf and fork nodes.
    const sharedProps = {
      key: nodeId, // for React
    };

    const isLeafNode = type === 'INLINE_LEAF' || type === 'LEAF';
    if (isLeafNode) {
      const props = { ...sharedProps, className };
      return (
        <div {...props}>
          {label}
        </div>
      );
    }

    // Get children if it's a fork.
    const { children } = node;
    const childNodes = children.map(elWithActions);
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

  return elWithActions;
};

export default Element;
